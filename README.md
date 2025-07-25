# UGC Backend 🚀

A Node.js backend for a User Generated Content platform with phone number authentication and file upload capabilities.

## Features ✨

- 📱 Phone number authentication with SMS verification codes
- 🔐 JWT-based authentication
- 📸 File upload support (images and other content)
- 👥 User profiles and posts
- 💬 Comments system
- 🗄️ PostgreSQL database with Prisma ORM

## Setup Instructions 📋

### 1. Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ugc_backend"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
```

### 2. Database Setup
You need PostgreSQL running. You can use:
- **Local PostgreSQL**: Install and run locally
- **Docker**: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`
- **Cloud**: Use services like Supabase, Railway, or Neon

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migration
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

## API Endpoints 📡

### Authentication
- `POST /auth/request-code` - Request verification code
- `POST /auth/verify-code` - Verify code and login
- `GET /profile` - Get user profile (protected)

### Health Check
- `GET /health` - Server health status

## Usage Examples 💡

### 1. Request Verification Code
```bash
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

### 2. Verify Code and Login
```bash
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "code": "123456"}'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema 🗄️

### Users
- Phone number authentication
- Optional name, email, and avatar
- Can create posts and comments

### Posts
- Title and content
- Optional image URL
- Linked to user
- Can have comments

### Comments
- Content
- Linked to user and post

## Next Steps 🎯

1. **Set up file uploads** with multer and cloud storage
2. **Add SMS integration** (Twilio, AWS SNS, etc.)
3. **Implement rate limiting** for security
4. **Add input validation** with Joi or Zod
5. **Set up Redis** for session management
6. **Add image processing** and optimization
7. **Implement search functionality**
8. **Add user following system**

## Development Notes 📝

- Verification codes are stored in memory (use Redis in production)
- SMS codes are logged to console (integrate real SMS service)
- JWT tokens expire in 7 days
- Database uses PostgreSQL with Prisma ORM

## Troubleshooting 🔧

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your DATABASE_URL in .env
- Verify database exists: `createdb ugc_backend`

### Port Issues
- Change PORT in .env if 3000 is occupied
- Check if another service is using the port

### Migration Issues
- Reset database: `npx prisma migrate reset`
- Regenerate client: `npx prisma generate` 