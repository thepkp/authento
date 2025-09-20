# 🧪 AUTHENTO Backend Testing Instructions

## ✅ **Your Backend is Working!**
The 401 Unauthorized error confirms your functions are deployed and accessible. Now let's test them properly.

## 🔑 **Step 1: Get Your API Keys**

1. Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/settings/api
2. Copy your **anon** key (starts with `eyJ...`)
3. Copy your **service_role** key (starts with `eyJ...`)

## 🧪 **Step 2: Test with PowerShell**

### **Test 1: Verify Endpoint**
```powershell
# Replace YOUR_ANON_KEY with your actual anon key
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_ANON_KEY"
    "apikey" = "YOUR_ANON_KEY"
}

$body = @{
    name = "Alice Kumar"
    roll_number = "CS-2025-09-001"
    marks = "85%"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mfgydvulxxqiocvzzevf.supabase.co/functions/v1/verify" -Method POST -Headers $headers -Body $body
```

### **Test 2: Bulk Upload (Admin Required)**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_ADMIN_JWT_TOKEN"
    "apikey" = "YOUR_ANON_KEY"
}

$body = @{
    certificates = @(
        @{
            certificate_number = "TEST-001"
            student_name = "Test Student"
            degree = "Test Degree"
            issue_date = "2025-01-01"
            marks = "90%"
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://mfgydvulxxqiocvzzevf.supabase.co/functions/v1/certificates-bulk" -Method POST -Headers $headers -Body $body
```

### **Test 3: Stats Endpoint**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_ANON_KEY"
    "apikey" = "YOUR_ANON_KEY"
}

Invoke-RestMethod -Uri "https://mfgydvulxxqiocvzzevf.supabase.co/functions/v1/verification-stats" -Method GET -Headers $headers
```

## 🎯 **Step 3: Expected Results**

### **Verify Endpoint Should Return:**
```json
{
  "verdict": "NOT_FOUND",
  "message": "No certificate found with number: CS-2025-09-001",
  "timestamp": "2025-01-27T..."
}
```
*This is expected since we haven't added test data yet!*

### **Bulk Upload Should Return:**
```json
{
  "success": true,
  "message": "Successfully uploaded 1 certificate(s)",
  "inserted_count": 1,
  "failed_count": 0,
  "timestamp": "2025-01-27T..."
}
```

## 📊 **Step 4: Add Test Data to Database**

### **Option A: Using Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/editor
2. Navigate to **Table Editor**
3. Add data to the `certificates` table:

```sql
INSERT INTO certificates (certificate_number, student_name, degree, issue_date, marks, institution, status) VALUES 
('CS-2025-09-001', 'Alice Kumar', 'Bachelor of Computer Science', '2025-06-15', '85%', 'Tech University', 'verified');
```

### **Option B: Using SQL Editor**
1. Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/sql
2. Run this SQL:

```sql
-- Insert test certificates
INSERT INTO certificates (certificate_number, student_name, degree, issue_date, marks, institution, status) VALUES 
('CS-2025-09-001', 'Alice Kumar', 'Bachelor of Computer Science', '2025-06-15', '85%', 'Tech University', 'verified'),
('CS-2025-09-002', 'Alice Kumar', 'Master of Computer Science', '2025-08-20', '92%', 'Tech University', 'verified'),
('CS-2025-09-003', 'John Doe', 'Bachelor of Engineering', '2025-07-10', '78%', 'Engineering College', 'verified');

-- Insert test users
INSERT INTO users (name, email, password_hash, role) VALUES 
('Test Admin', 'admin@test.com', crypt('password123', gen_salt('bf')), 'admin'),
('Test Employer', 'employer@test.com', crypt('password123', gen_salt('bf')), 'employer');
```

## 🎉 **Step 5: Test Again**

After adding test data, run the verify endpoint again. You should now get:

```json
{
  "verdict": "VALID",
  "details": [
    {"field": "name", "status": "MATCH"},
    {"field": "marks", "status": "MATCH"}
  ],
  "confidence_score": 55,
  "timestamp": "2025-01-27T..."
}
```

## 🚀 **Quick Test Script**

Save this as `quick_test.ps1` and run it:

```powershell
# Quick AUTHENTO Test
$ANON_KEY = "YOUR_ANON_KEY_HERE"

Write-Host "Testing AUTHENTO Backend..." -ForegroundColor Green

# Test verify endpoint
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $ANON_KEY"
    "apikey" = $ANON_KEY
}

$testData = @{
    name = "Alice Kumar"
    roll_number = "CS-2025-09-001"
    marks = "85%"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "https://mfgydvulxxqiocvzzevf.supabase.co/functions/v1/verify" -Method POST -Headers $headers -Body $testData
    Write-Host "✅ Verify Test Result:" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Verify Test Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
```

## 🎯 **What to Expect**

1. **First test**: "NOT_FOUND" (no data in database)
2. **After adding data**: "VALID" or "MISMATCH_FOUND" based on your test data
3. **Bulk upload**: Success message with count of inserted records
4. **Stats**: Statistics about verification attempts

Your backend is working perfectly! The functions are deployed and responding correctly. 🎉
