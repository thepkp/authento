// AUTHENTO - Bulk Certificate Upload Endpoint
// Secure endpoint for admin users to upload multiple certificate records

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface CertificateData {
  student_id?: string;
  certificate_file_url?: string;
  certificate_number: string;
  status?: 'pending' | 'verified' | 'rejected';
  student_name: string;
  degree: string;
  issue_date: string;
  marks: string;
  institution?: string;
}

interface BulkUploadResult {
  success: boolean;
  message: string;
  inserted_count: number;
  failed_count: number;
  errors?: Array<{
    index: number;
    certificate_number: string;
    error: string;
  }>;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed. Only POST requests are accepted.' 
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Create Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // Authorize the user by checking their role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authorization header is required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid or expired token' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (userData.role !== 'admin') {
      return new Response(JSON.stringify({ 
        error: 'Forbidden: Admin access required' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!userData.is_active) {
      return new Response(JSON.stringify({ 
        error: 'Account is deactivated' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Parse and validate input data
    const requestBody = await req.json();
    const { certificates } = requestBody;

    if (!certificates || !Array.isArray(certificates)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request body. "certificates" must be an array.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (certificates.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Empty certificates array. At least one certificate is required.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (certificates.length > 1000) {
      return new Response(JSON.stringify({ 
        error: 'Too many certificates. Maximum 1000 certificates per request.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Validate each certificate
    const validationErrors: Array<{ index: number; certificate_number: string; error: string }> = [];
    const validCertificates: CertificateData[] = [];

    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      const errors: string[] = [];

      // Required field validation
      if (!cert.certificate_number || typeof cert.certificate_number !== 'string') {
        errors.push('certificate_number is required and must be a string');
      }
      if (!cert.student_name || typeof cert.student_name !== 'string') {
        errors.push('student_name is required and must be a string');
      }
      if (!cert.degree || typeof cert.degree !== 'string') {
        errors.push('degree is required and must be a string');
      }
      if (!cert.issue_date) {
        errors.push('issue_date is required');
      }
      if (!cert.marks || typeof cert.marks !== 'string') {
        errors.push('marks is required and must be a string');
      }

      // Date validation
      if (cert.issue_date) {
        const issueDate = new Date(cert.issue_date);
        if (isNaN(issueDate.getTime())) {
          errors.push('issue_date must be a valid date');
        } else if (issueDate > new Date()) {
          errors.push('issue_date cannot be in the future');
        }
      }

      // String length validation
      if (cert.certificate_number && cert.certificate_number.length > 100) {
        errors.push('certificate_number must be 100 characters or less');
      }
      if (cert.student_name && cert.student_name.length > 200) {
        errors.push('student_name must be 200 characters or less');
      }
      if (cert.degree && cert.degree.length > 200) {
        errors.push('degree must be 200 characters or less');
      }
      if (cert.marks && cert.marks.length > 50) {
        errors.push('marks must be 50 characters or less');
      }
      if (cert.institution && cert.institution.length > 200) {
        errors.push('institution must be 200 characters or less');
      }

      if (errors.length > 0) {
        validationErrors.push({
          index: i,
          certificate_number: cert.certificate_number || 'unknown',
          error: errors.join('; ')
        });
      } else {
        validCertificates.push({
          ...cert,
          status: cert.status || 'pending',
          verification_result: 'pending'
        });
      }
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: `Validation failed for ${validationErrors.length} certificate(s)`,
        inserted_count: 0,
        failed_count: validationErrors.length,
        errors: validationErrors,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check for duplicate certificate numbers
    const certificateNumbers = validCertificates.map(cert => cert.certificate_number);
    const { data: existingCerts } = await supabaseAdmin
      .from('certificates')
      .select('certificate_number')
      .in('certificate_number', certificateNumbers);

    if (existingCerts && existingCerts.length > 0) {
      const duplicates = existingCerts.map(cert => cert.certificate_number);
      return new Response(JSON.stringify({
        success: false,
        message: `Duplicate certificate numbers found: ${duplicates.join(', ')}`,
        inserted_count: 0,
        failed_count: validCertificates.length,
        timestamp: new Date().toISOString()
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Perform bulk insert
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('certificates')
      .insert(validCertificates)
      .select('id, certificate_number, student_name');

    if (insertError) {
      console.error('Bulk insert error:', insertError);
      return new Response(JSON.stringify({
        success: false,
        message: 'Database error during bulk insert',
        error: insertError.message,
        inserted_count: 0,
        failed_count: validCertificates.length,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const result: BulkUploadResult = {
      success: true,
      message: `Successfully uploaded ${insertedData.length} certificate(s)`,
      inserted_count: insertedData.length,
      failed_count: 0,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error during bulk upload',
      error: error.message,
      inserted_count: 0,
      failed_count: 0,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
})
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/certificates-bulk' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
