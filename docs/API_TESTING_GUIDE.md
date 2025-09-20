# AUTHENTO API Testing Guide

## 🚀 Your Functions Are Deployed!

Your Supabase Edge Functions are now live at:
- **Project ID**: `mfgydvulxxqiocvzzevf`
- **Dashboard**: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/functions

## 📋 Available Endpoints

### 1. **Verify Certificate** - `POST /functions/v1/verify`
**Purpose**: Verify a certificate using OCR data

**Request Body**:
```json
{
  "name": "Alice Kumar",
  "roll_number": "CS-2025-09-001",
  "marks": "85%",
  "degree": "Bachelor of Computer Science",
  "issue_date": "2025-06-15",
  "institution": "Tech University"
}
```

**Response**:
```json
{
  "verdict": "VALID",
  "details": [
    {"field": "name", "status": "MATCH"},
    {"field": "marks", "status": "MATCH"},
    {"field": "degree", "status": "MATCH"}
  ],
  "confidence_score": 90,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### 2. **Bulk Upload Certificates** - `POST /functions/v1/certificates-bulk`
**Purpose**: Upload multiple certificates (Admin only)

**Request Body**:
```json
{
  "certificates": [
    {
      "certificate_number": "CS-2025-09-003",
      "student_name": "John Doe",
      "degree": "Master of Computer Science",
      "issue_date": "2025-07-20",
      "marks": "88%",
      "institution": "Tech University"
    }
  ]
}
```

### 3. **Get Verification Stats** - `GET /functions/v1/verification-stats`
**Purpose**: Get analytics and statistics

**Query Parameters**:
- `days` (optional): Number of days for daily stats (default: 30)

## 🧪 Testing Commands

### Test Verify Endpoint:
```bash
curl -X POST "https://mfgydvulxxqiocvzzevf.supabase.co/functions/v1/verify" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Kumar",
    "roll_number": "CS-2025-09-001",
    "marks": "85%"
  }'
```

### Test Bulk Upload:
```bash
curl -X POST "https://mfgydvulxxqiocvzzevf.supabase.co/functions/v1/certificates-bulk" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificates": [
      {
        "certificate_number": "TEST-001",
        "student_name": "Test Student",
        "degree": "Test Degree",
        "issue_date": "2025-01-01",
        "marks": "90%"
      }
    ]
  }'
```

## 🔑 Authentication Setup

### 1. Get Your API Keys:
- Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/settings/api
- Copy your `anon` key and `service_role` key

### 2. Create Test Users:
```sql
-- Insert test admin user
INSERT INTO users (name, email, password_hash, role) VALUES 
('Test Admin', 'admin@test.com', crypt('password123', gen_salt('bf')), 'admin');

-- Insert test employer
INSERT INTO users (name, email, password_hash, role) VALUES 
('Test Employer', 'employer@test.com', crypt('password123', gen_salt('bf')), 'employer');
```

### 3. Get JWT Tokens:
Use Supabase Auth to sign in and get JWT tokens for testing.

## 🎯 Next Development Steps

### Priority 1: Frontend Development
1. **Create React App** with Vite
2. **Set up Tailwind CSS**
3. **Create authentication pages**
4. **Build certificate upload interface**
5. **Create verification dashboard**

### Priority 2: OCR Integration
1. **Set up Tesseract.js** for client-side OCR
2. **Integrate Google Vision API** for better accuracy
3. **Create document upload component**
4. **Add image preprocessing**

### Priority 3: Blockchain Integration
1. **Set up Polygon Mumbai testnet**
2. **Create Solidity smart contracts**
3. **Integrate Ethers.js**
4. **Add certificate hashing to blockchain**

## 🐛 Common Issues & Solutions

### Issue: "Function not found"
**Solution**: Make sure you're using the correct project URL and function names

### Issue: "Authentication failed"
**Solution**: Check your JWT token and ensure it's valid

### Issue: "Admin access required"
**Solution**: Make sure the user has 'admin' role in the database

## 📊 Database Status
Your database has these tables:
- ✅ `users` - User management
- ✅ `certificates` - Trusted certificate records
- ✅ `verificationlogs` - Verification attempt logs
- ✅ `blacklist` - Fraudulent user records

## 🚀 Ready to Build!
Your backend is complete and deployed. You can now:
1. Start building the frontend
2. Test the API endpoints
3. Integrate OCR services
4. Add blockchain features

Choose your next step and let me know what you'd like to focus on!
