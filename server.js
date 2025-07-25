const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const WeChatService = require('./services/wechatService');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const wechatService = new WeChatService();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UGC Backend is running!',
    endpoints: {
      health: '/health',
      wechatLogin: '/api/wechat/login',
      wechatUpdateUser: '/api/wechat/update-userinfo',
      profile: '/profile'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'UGC Backend is running!' });
});





// WeChat login endpoint
app.post('/api/wechat/login', async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少登录code' 
      });
    }

    // Check if WeChat is configured
    if (!wechatService.isConfigured()) {
      return res.status(500).json({ 
        success: false, 
        message: 'WeChat authentication is not configured' 
      });
    }

    // Exchange code for session data
    const sessionResult = await wechatService.exchangeCodeForSession(code);
    
    if (!sessionResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: sessionResult.error 
      });
    }

    const { openid, session_key, unionid } = sessionResult;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { wechatOpenId: openid },
          { wechatUnionId: unionid }
        ]
      }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          wechatOpenId: openid,
          wechatUnionId: unionid,
          wechatSessionKey: session_key,
          name: userInfo?.nickName || null,
          avatar: userInfo?.avatarUrl || null
        }
      });
    } else {
      // Update existing user's session key
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          wechatSessionKey: session_key,
          name: userInfo?.nickName || user.name,
          avatar: userInfo?.avatarUrl || user.avatar
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        wechatOpenId: user.wechatOpenId,
        loginMethod: 'wechat'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      openid: user.wechatOpenId,
      session_key: session_key,
      unionid: user.wechatUnionId,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        wechatOpenId: user.wechatOpenId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error in WeChat login:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// WeChat user info update endpoint
app.post('/api/wechat/update-userinfo', authenticateToken, async (req, res) => {
  try {
    const { nickName, avatarUrl, gender, country, province, city, language } = req.body;
    
    if (!req.user.wechatOpenId) {
      return res.status(400).json({ error: 'User not authenticated via WeChat' });
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: nickName,
        avatar: avatarUrl
      }
    });

    res.json({
      message: 'User info updated successfully',
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        wechatOpenId: user.wechatOpenId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating WeChat user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 UGC Backend server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel
module.exports = app;

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 