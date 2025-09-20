# Quick AUTHENTO Test with Service Role Key
Write-Host "Quick AUTHENTO Test" -ForegroundColor Green

Write-Host "`nStep 1: Get your Service Role Key" -ForegroundColor Yellow
Write-Host "Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/settings/api" -ForegroundColor Cyan
Write-Host "Copy the 'service_role' key and paste it below:" -ForegroundColor White

# You need to replace this with your actual service role key
$SERVICE_ROLE_KEY = "PASTE_YOUR_SERVICE_ROLE_KEY_HERE"

if ($SERVICE_ROLE_KEY -eq "PASTE_YOUR_SERVICE_ROLE_KEY_HERE") {
    Write-Host "`n❌ Please replace PASTE_YOUR_SERVICE_ROLE_KEY_HERE with your actual service role key!" -ForegroundColor Red
    Write-Host "`nTo get it:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/settings/api" -ForegroundColor White
    Write-Host "2. Scroll down to 'Project API keys'" -ForegroundColor White
    Write-Host "3. Copy the 'service_role' key (starts with eyJ...)" -ForegroundColor White
    Write-Host "4. Replace PASTE_YOUR_SERVICE_ROLE_KEY_HERE in this script" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    exit
}

Write-Host "`nStep 2: Adding test data to database..." -ForegroundColor Yellow
Write-Host "Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/sql" -ForegroundColor Cyan
Write-Host "Run this SQL first:" -ForegroundColor White
Write-Host @"
INSERT INTO certificates (certificate_number, student_name, degree, issue_date, marks, institution, status, verification_result) VALUES 
('CS-2025-09-001', 'Alice Kumar', 'Bachelor of Computer Science', '2025-06-15', '85%', 'Tech University', 'verified', 'pending'),
('CS-2025-09-002', 'Alice Kumar', 'Master of Computer Science', '2025-08-20', '92%', 'Tech University', 'verified', 'pending');
"@ -ForegroundColor Gray

Write-Host "`nStep 3: Testing with Service Role Key..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $SERVICE_ROLE_KEY"
    "apikey" = $SERVICE_ROLE_KEY
}

# Test 1: Verify Alice Kumar's certificate
Write-Host "`nTest 1: Verifying Alice Kumar's certificate..." -ForegroundColor Cyan
$testData = @{
    name = "Alice Kumar"
    roll_number = "CS-2025-09-001"
    marks = "85%"
    degree = "Bachelor of Computer Science"
    issue_date = "2025-06-15"
    institution = "Tech University"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "https://mfgydvulxxqiocvzzevf.supabase.co/functions/v1/verify" -Method POST -Headers $headers -Body $testData
    Write-Host "✅ SUCCESS! Verification Result:" -ForegroundColor Green
    $result | ConvertTo-Json -Depth 3
    
    Write-Host "`n🎉 Your backend is working perfectly!" -ForegroundColor Green
    Write-Host "Check your database - the verification_result field should be updated!" -ForegroundColor White
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you added the test data to your database first!" -ForegroundColor Yellow
}

Write-Host "`nStep 4: Check your database" -ForegroundColor Yellow
Write-Host "Go to: https://supabase.com/dashboard/project/mfgydvulxxqiocvzzevf/editor" -ForegroundColor Cyan
Write-Host "Check the certificates table - verification_result should be updated!" -ForegroundColor White
