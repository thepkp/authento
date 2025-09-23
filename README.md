# AUTHENTO - Certificate Verification System

![AUTHENTO Logo](https://img.shields.io/badge/AUTHENTO-Certificate%20Verification-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Edge%20Functions-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## 🎯 Project Overview

**AUTHENTO** is a digital platform for validating academic degrees and certificates. It uses OCR technology, database cross-verification, and blockchain support to detect fake academic documents and provide reliable verification for employers, institutions, and government bodies.

**Problem Statement (SIH ID 25029):** Combat the rising issue of fake academic degrees and certificates by creating a secure, scalable, and intelligent verification system.

## 🏗️ Architecture

### Backend Stack
- **Database**: PostgreSQL (Supabase)
- **API**: Supabase Edge Functions (TypeScript/Deno)
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage
- **Deployment**: Supabase Cloud

### Database Schema
- **users**: User management and roles
- **certificates**: Trusted certificate records
- **verificationlogs**: Verification attempt logs
- **blacklist**: Fraudulent user records

## 🚀 Features

### ✅ Completed Backend Features
- **Certificate Verification Engine**: OCR data comparison with database records
- **Bulk Certificate Upload**: Admin endpoint for mass certificate uploads
- **Verification Statistics**: Analytics and reporting dashboard
- **User Management**: Role-based access control (student, employer, admin)
- **Security**: JWT authentication, input validation, rate limiting
- **Logging**: Comprehensive verification attempt tracking

### 🔄 In Progress (Team Tasks)
- **Frontend Development**: React application with Tailwind CSS
- **OCR Integration**: Tesseract.js and Google Vision API
- **Blockchain Features**: Polygon integration with Solidity contracts
- **Mobile App**: Cross-platform mobile application

## 📁 Project Structure

```
AUTHENTO/
├── supabase/
│   ├── functions/
│   │   ├── verify/                 # Certificate verification endpoint
│   │   ├── certificates-bulk/      # Bulk upload endpoint
│   │   └── verification-stats/     # Analytics endpoint
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Database schema
│   └── config.toml                 # Supabase configuration
├── docs/
│   ├── API_TESTING_GUIDE.md        # API documentation
│   └── TESTING_INSTRUCTIONS.md     # Testing guide
├── .gitignore
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase CLI
- Git

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AUTHENTO.git
   cd AUTHENTO
   ```

2. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

3. **Start local development**
   ```bash
   supabase start
   ```

4. **Deploy functions**
   ```bash
   supabase functions deploy
   ```

## 📚 API Documentation

### Endpoints

#### 1. Verify Certificate
- **URL**: `POST /functions/v1/verify`
- **Purpose**: Verify certificate using OCR data
- **Authentication**: Required (JWT)

#### 2. Bulk Upload Certificates
- **URL**: `POST /functions/v1/certificates-bulk`
- **Purpose**: Upload multiple certificates (Admin only)
- **Authentication**: Required (Admin JWT)

#### 3. Get Verification Statistics
- **URL**: `GET /functions/v1/verification-stats`
- **Purpose**: Get analytics and statistics
- **Authentication**: Required (JWT)

### Example Usage

```typescript
// Verify a certificate
const response = await fetch('https://your-project.supabase.co/functions/v1/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt_token}`,
    'apikey': 'your_anon_key'
  },
  body: JSON.stringify({
    name: "Alice Kumar",
    roll_number: "CS-2025-09-001",
    marks: "85%",
    degree: "Bachelor of Computer Science",
    issue_date: "2025-06-15",
    institution: "Tech University"
  })
});
```

## 🧪 Testing

### Backend Testing
```bash
# Test function accessibility
.\safe_test.ps1

# Test with data (requires JWT token)
.\quick_test.ps1
```

### Database Testing
1. Add test data using SQL editor
2. Test verification endpoints
3. Check verification_result updates

## 🔐 Security

- **JWT Authentication**: All endpoints require valid JWT tokens
- **Role-based Access**: Different permissions for students, employers, admins
- **Input Validation**: Comprehensive data validation and sanitization
- **Rate Limiting**: Protection against abuse
- **Secret Management**: Environment variables for sensitive data

## 👥 Team Structure

- **Team Lead**: Backend Development (Completed ✅)
- **Frontend Developer**: React application with Tailwind CSS
- **OCR Specialist**: Tesseract.js and Google Vision API integration
- **Blockchain Developer**: Polygon integration with Solidity contracts
- **Mobile Developer**: Cross-platform mobile application
- **UI/UX Designer**: User interface and experience design

## 🚀 Deployment

### Production Environment
- **Backend**: Deployed on Supabase Cloud
- **Database**: PostgreSQL on Supabase
- **Functions**: Edge Functions deployed globally
- **Domain**: Configure custom domain in Supabase

### Environment Variables
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Database Schema

### Users Table
- `id` (uuid, primary key)
- `name` (text)
- `email` (text, unique)
- `password_hash` (text)
- `role` (text: 'student', 'employer', 'admin')
- `created_at` (timestamp)

### Certificates Table
- `id` (uuid, primary key)
- `student_id` (uuid, foreign key)
- `certificate_number` (text, unique)
- `student_name` (text)
- `degree` (text)
- `issue_date` (date)
- `marks` (text)
- `status` (text: 'pending', 'verified', 'rejected')
- `verification_result` (text: 'valid', 'fake', 'suspicious')
- `created_at` (timestamp)

## 🔄 Development Workflow

1. **Backend**: Complete ✅
2. **Database**: Complete ✅
3. **API Documentation**: Complete ✅
4. **Frontend**: In Progress
5. **OCR Integration**: In Progress
6. **Blockchain**: In Progress
7. **Mobile App**: In Progress

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of Smart India Hackathon 2025 (SIH ID 25029).

## 📞 Contact

- **Team Lead**: [Your Name]
- **Project Repository**: [GitHub Link]
- **Supabase Dashboard**: [Project Dashboard]

---

**Status**: Backend Complete ✅ | Frontend In Progress 🔄 | Ready for Team Collaboration 🚀
