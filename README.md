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
  - Email (SendGrid/AWS SES), SMS (Twilio), Push (Firebase)
  - Session reminders, crisis alerts

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
- **Notifications:** Email (SendGrid/AWS SES), SMS (Twilio), Push (Firebase)
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

3. **Create `.env` File**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key

   # Email configuration
   EMAIL_HOST=your_email_host
   EMAIL_PORT=your_email_port
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_pass

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

---

## 🔒 Security & Privacy

- End-to-end encryption for sensitive communications
- Data anonymization for anonymous users
- GDPR-compliant privacy features
- Audit logging & monitoring
- Rate limiting & DDoS protection

---

## 📅 Roadmap & Progress

- [x] Project setup & architecture
- [x] Authentication & user management
- [x] Victim support system
- [x] Expert management (KYC, credential upload, profile)
- [x] Session booking & communication
- [x] Resource & crisis management
- [x] Admin dashboard & analytics
- [x] AWS S3 integration for file uploads
- [x] Swagger API documentation
- [ ] Support group & crisis hotline endpoints
- [ ] Notification system (push/email/SMS)
- [ ] Deployment & scaling

---

## 🛠️ Third-party Integrations

- **AWS S3:** Credential & document storage
- **Twilio/Agora:** Video calls & SMS
- **SendGrid/AWS SES:** Email notifications
- **Firebase:** Push notifications

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👤 Author

NOAH LUCKY