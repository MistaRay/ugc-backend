# WeChat Authentication Setup Guide 🚀

This guide will help you set up WeChat authentication in your UGC Backend project.

## Prerequisites 📋

1. **WeChat Developer Account**: You need a WeChat developer account
2. **WeChat Mini Program**: Create a mini program in the WeChat developer console
3. **App ID and App Secret**: Get these from your WeChat mini program settings

## Environment Variables Setup 🔧

Add the following environment variables to your `.env` file:

```env
# WeChat Configuration
WECHAT_APP_ID=your_wechat_app_id_here
WECHAT_APP_SECRET=your_wechat_app_secret_here

# Existing variables (keep these)
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url_here
```

## Database Migration 🗄️

Run the following commands to update your database schema:

```bash
# Generate the migration
npx prisma migrate dev --name add_wechat_fields

# Apply the migration
npx prisma generate
```

## API Endpoints 📡

### 1. WeChat Login
**POST** `/auth/wechat-login`

**Request Body:**
```json
{
  "code": "temporary_login_code_from_wechat",
  "userInfo": {
    "nickName": "User's nickname",
    "avatarUrl": "https://avatar.url",
    "gender": 1,
    "country": "China",
    "province": "Beijing",
    "city": "Beijing",
    "language": "zh_CN"
  }
}
```

**Response:**
```json
{
  "message": "WeChat login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "User's nickname",
    "avatar": "https://avatar.url",
    "wechatOpenId": "openid_here",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Update WeChat User Info
**POST** `/auth/wechat-update-userinfo`

**Headers:** `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "nickName": "Updated nickname",
  "avatarUrl": "https://new-avatar.url",
  "gender": 1,
  "country": "China",
  "province": "Shanghai",
  "city": "Shanghai",
  "language": "zh_CN"
}
```

## Frontend Integration (WeChat Mini Program) 📱

### 1. Login Flow
```javascript
// In your mini program
wx.login({
  success: (res) => {
    if (res.code) {
      // Send code to your backend
      wx.request({
        url: 'https://your-backend.com/auth/wechat-login',
        method: 'POST',
        data: {
          code: res.code,
          userInfo: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language
          }
        },
        success: (response) => {
          // Store token and user info
          wx.setStorageSync('token', response.data.token);
          wx.setStorageSync('userInfo', response.data.user);
          
          // Navigate to main page
          wx.switchTab({
            url: '/pages/index/index'
          });
        },
        fail: (error) => {
          console.error('Login failed:', error);
        }
      });
    }
  }
});
```

### 2. Get User Info
```javascript
// Get user profile info
wx.getUserProfile({
  desc: '用于完善用户资料',
  success: (res) => {
    const userInfo = res.userInfo;
    
    // Update user info on backend
    wx.request({
      url: 'https://your-backend.com/auth/wechat-update-userinfo',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      data: userInfo,
      success: (response) => {
        console.log('User info updated:', response.data);
      }
    });
  }
});
```

## Security Considerations 🔒

1. **Session Key Storage**: The session key is temporarily stored for development. In production, consider not storing it or using a more secure method.

2. **Token Validation**: Always validate JWT tokens on protected routes.

3. **HTTPS**: Ensure all API calls use HTTPS in production.

4. **Rate Limiting**: Consider implementing rate limiting for login attempts.

## Error Handling 🚨

Common error responses:

```json
{
  "error": "WeChat login code is required"
}
```

```json
{
  "error": "WeChat authentication is not configured"
}
```

```json
{
  "error": "WeChat API error: 40029 - invalid code"
}
```

## Testing 🧪

### Development Testing
For development without a real WeChat mini program, you can:

1. Use the WeChat developer tools
2. Create a mock login flow
3. Test with sample codes from WeChat documentation

### Production Testing
1. Deploy to a server with HTTPS
2. Configure your WeChat mini program's server domain
3. Test with real WeChat users

## Troubleshooting 🔧

### Common Issues

1. **"WeChat authentication is not configured"**
   - Check your environment variables
   - Ensure WECHAT_APP_ID and WECHAT_APP_SECRET are set

2. **"invalid code" error**
   - Codes are single-use and expire quickly
   - Ensure you're using a fresh code from wx.login()

3. **Database migration errors**
   - Run `npx prisma migrate reset` if needed
   - Check your database connection

4. **CORS issues**
   - Ensure your WeChat mini program domain is configured
   - Check CORS settings in your Express app

## Support 📞

If you encounter issues:

1. Check the WeChat developer documentation
2. Verify your App ID and App Secret
3. Test with WeChat developer tools
4. Check server logs for detailed error messages

## Next Steps 🎯

After setting up WeChat authentication:

1. Implement user profile management
2. Add logout functionality
3. Implement token refresh mechanism
4. Add user avatar upload functionality
5. Implement user data export/import

Happy coding! 🎉 