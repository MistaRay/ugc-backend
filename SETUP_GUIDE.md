# 🚀 Complete WeChat Authentication Setup Guide

## 📋 Prerequisites Checklist

- [ ] WeChat Developer Account
- [ ] WeChat Mini Program created
- [ ] App ID and App Secret from WeChat console
- [ ] Backend server running on port 3000
- [ ] ngrok installed and running

## 🔧 Step 1: Environment Variables

Create a `.env` file in your backend root with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ugc_backend"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# WeChat Configuration
WECHAT_APP_ID="your_wechat_app_id_here"
WECHAT_APP_SECRET="your_wechat_app_secret_here"

# Server Configuration
PORT=3000
NODE_ENV=development
```

## 🌐 Step 2: Start Backend Server

```bash
npm run dev
```

Your server should be running on `http://localhost:3000`

## 🔗 Step 3: Start ngrok Tunnel

In a new terminal:

```bash
ngrok http 3000
```

Look for the HTTPS URL in the output:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

**Copy this HTTPS URL** - you'll need it for the frontend.

## 📱 Step 4: Update Frontend Configuration

In your WeChat Mini Program frontend, update the API URL to use your ngrok URL:

```javascript
// Change from:
url: 'http://localhost:3000/api/wechat/login'

// To:
url: 'https://your-ngrok-url.ngrok.io/api/wechat/login'
```

## 🗄️ Step 5: Database Migration

Run these commands to update your database:

```bash
npx prisma migrate dev --name add_wechat_fields
npx prisma generate
```

## 🧪 Step 6: Test the Integration

1. **Test Backend Health**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Test WeChat Endpoint** (with ngrok URL):
   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/api/wechat/login \
     -H "Content-Type: application/json" \
     -d '{"code":"test_code"}'
   ```

## 🔍 Troubleshooting

### Common Issues:

1. **"WeChat authentication is not configured"**
   - Check your `.env` file has `WECHAT_APP_ID` and `WECHAT_APP_SECRET`

2. **ngrok not working**
   - Make sure ngrok is running: `ngrok http 3000`
   - Check the ngrok URL is accessible

3. **Database errors**
   - Run: `npx prisma migrate reset`
   - Check your `DATABASE_URL` in `.env`

4. **CORS issues**
   - Your backend already has CORS enabled
   - Make sure you're using the HTTPS ngrok URL

## 📞 API Endpoints Available

- `GET /health` - Health check
- `POST /api/wechat/login` - WeChat login
- `POST /api/wechat/update-userinfo` - Update user info
- `GET /profile` - Get user profile (protected)

## 🎯 Next Steps

1. Configure your WeChat Mini Program to use the ngrok URL
2. Test the login flow in WeChat DevTools
3. Deploy to production when ready

Happy coding! 🎉 