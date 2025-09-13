]# Safe Anchor Backend

Safe Anchor is a secure, privacy-focused backend platform connecting abuse victims with verified experts, support groups, and crisis resources. The system prioritizes anonymity, safety, and accessibility, offering real-time support through chat, video sessions, and emergency services.

---

## 🚀 Features

- **Authentication & User Management**
  - Secure registration & login (JWT + Refresh Tokens)
  - Role-based access: victim, expert, admin
  - Password reset via email (6-digit code)
  - Anonymous access for victims

- **Victim Support System**
  - Anonymous questionnaires & expert matching
  - Emergency contact management
  - Session history & expert preference updates
  - Access to anonymous resources

- **Expert Management**
  - Professional KYC verification (AWS S3 integration)
  - Credential upload (S3)
  - Profile management & public profiles
  - Availability & scheduling
  - Session notes

- **Session Management**
  - Booking, rescheduling, cancellation
  - Double-booking prevention
  - Chat & video support sessions (WebSocket, Twilio/Agora)
  - Session history

- **Resource Management**
  - CRUD for articles, survivor stories, guides
  - Resource categories, search, recommendations

- **Support & Crisis Services**
  - Crisis hotlines & emergency services
  - Support group management

- **Notification System**
  - Email (Gmail SMTP), SMS (Twilio), Push (Firebase)
  - Session reminders, crisis alerts
  - Email verification for user registration

- **Admin Dashboard**
  - User & expert management
  - Analytics & reporting tools

- **Security & Privacy**
  - End-to-end encryption
  - Data anonymization for anonymous users
  - GDPR-compliant privacy features
  - Audit logging & monitoring
  - Rate limiting & DDoS protection

---

## 🏗️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Cache/Queue:** Redis
- **Auth:** JWT + Refresh Tokens
- **File Storage:** AWS S3 (KYC & credentials)
- **Notifications:** Email (Gmail SMTP), SMS (Twilio), Push (Firebase)
- **Real-time:** WebSocket (Socket.io), Video Calls (Twilio/Agora)
- **Testing:** Jest, Supertest, Postman

---

## 📂 Project Structure

```
safe-anchor-backend/
├── config/          # Database & service configurations
├── controllers/     # Route controllers
├── models/          # Mongoose models
├── routes/          # Express routes
├── middleware/      # Auth, privacy, rate limiting
├── services/        # Business logic (matching, notifications, payments)
├── utils/           # Helpers & utilities
├── app.js           # Express app configuration
├── server.js        # Entry point
├── .env             # Environment variables
└── package.json
```

---

## ⚙️ Installation & Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/safe-anchor-backend.git
   cd safe-anchor-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your actual values
   nano .env  # or use your preferred editor
   ```
   
   **Required Environment Variables:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/safe-anchor?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   
   # Gmail Configuration
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   GMAIL_FROM_EMAIL=your-gmail@gmail.com
   
   # Frontend URL (for CORS and email redirects)
   FRONTEND_URL=http://localhost:3000
   # Production Frontend URL
   # FRONTEND_URL=https://safe-anchor-web-page.vercel.app
   
   # Email Verification & Password Reset
   EMAIL_VERIFICATION_SECRET=your-email-verification-secret
   PASSWORD_RESET_SECRET=your-password-reset-secret

   # AWS S3 configuration
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_s3_bucket_name
   ```

4. **Run the Server**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

- **Automated:** Jest & Supertest for API/unit testing
- **Manual:** Postman collection for endpoint testing

Run tests:
```bash
npm test
```

---

## 📖 API Documentation

- **Swagger UI:**  
  Visit [`/api-docs`](http://localhost:5000/api-docs) after starting the server for interactive API docs.

## 🌐 Frontend Integration

- **Frontend URL:** https://safe-anchor-web-page.vercel.app
- **CORS Configuration:** Backend is configured to accept requests from the Vercel frontend
- **Email Verification Links:** Redirect to the Vercel frontend for user verification
- **Password Reset Links:** Redirect to the Vercel frontend for password reset

### CORS Security Configuration

The backend is configured with strict CORS policies for security:

```javascript
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'http://localhost:3001', // Alternative local port
  'https://safe-anchor-web-page.vercel.app', // Production Vercel frontend
  process.env.FRONTEND_URL // Environment variable override
];
```

**Security Features:**
- ✅ **Whitelist-based CORS** - Only specific domains are allowed
- ✅ **Environment variable support** - Flexible configuration via FRONTEND_URL
- ✅ **Development support** - Local development URLs included
- ✅ **Production ready** - Vercel frontend URL explicitly allowed
- ✅ **Credentials support** - Cookies and authorization headers allowed
- ✅ **Method restrictions** - Only necessary HTTP methods allowed

---

## 🔒 Security & Privacy

### CORS Security
- **Whitelist-based CORS** - Only approved domains can access the API
- **Vercel Frontend Integration** - https://safe-anchor-web-page.vercel.app explicitly allowed
- **Environment Variable Support** - Flexible configuration via FRONTEND_URL
- **Credentials Support** - Secure cookie and authorization header handling

### Authentication & Authorization
- **JWT Tokens** - Secure user authentication with refresh token mechanism
- **Email Verification** - Required for all user registrations
- **Password Security** - bcrypt hashing with salt rounds
- **Role-based Access** - Victim, Expert, and Admin roles

### API Security
- **Rate Limiting** - Prevents abuse and DDoS attacks
- **Input Validation** - All inputs are validated and sanitized
- **Security Headers** - Helmet.js for comprehensive security headers
- **Request Size Limits** - Prevents large payload attacks

### Data Protection
- **MongoDB Atlas** - Cloud-hosted database with encryption at rest
- **Environment Variables** - Sensitive data stored securely
- **CORS Protection** - Prevents unauthorized cross-origin requests
- **Audit Logging** - Comprehensive request and error logging

### Privacy Features
- **Anonymous Access** - Victims can use the system anonymously
- **Data Anonymization** - Personal data is protected
- **GDPR Compliance** - Privacy-focused design
- **Secure Email** - Gmail SMTP with app password authentication

---

## 📅 Roadmap & Progress

- [x] Project setup & architecture
- [x] Authentication & user management
- [x] Email verification system (Gmail SMTP)
- [x] Victim support system
- [x] Expert management (KYC, credential upload, profile)
- [x] Session booking & communication
- [x] Resource & crisis management
- [x] Admin dashboard & analytics
- [x] AWS S3 integration for file uploads
- [x] Swagger API documentation
- [x] Support group & crisis hotline endpoints
- [x] Email notification system (Gmail SMTP)
- [x] MongoDB Atlas cloud database integration
- [x] Production-ready deployment configuration
- [ ] SMS notifications (Twilio)
- [ ] Push notifications (Firebase)

---

## 🛠️ Third-party Integrations

- **MongoDB Atlas:** Cloud database hosting
- **AWS S3:** Credential & document storage
- **Gmail SMTP:** Email notifications and verification
- **Twilio/Agora:** Video calls & SMS
- **Firebase:** Push notifications

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👤 Author

NOAH LUCKY