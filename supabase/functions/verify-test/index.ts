// AUTHENTO - Test Verify Endpoint (No Auth Required)
// This is a test version that doesn't require authentication

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface OCRData {
  name: string;
  roll_number: string;
  marks: string;
  degree?: string;
  issue_date?: string;
  institution?: string;
}

interface VerificationResult {
  verdict: 'VALID' | 'MISMATCH_FOUND' | 'NOT_FOUND' | 'SUSPICIOUS';
  details: Array<{
    field: string;
    status: 'MATCH' | 'MISMATCH' | 'MISSING';
    expected?: string;
    found?: string;
  }>;
  confidence_score?: number;
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

    // Parse and validate OCR data
    const ocrData: OCRData = await req.json();
    
    if (!ocrData || !ocrData.roll_number) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request. OCR data with roll_number is required.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create Supabase client with service role key for testing
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the certificate in the database using roll_number
    const { data: dbRecord, error: dbError } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('certificate_number', ocrData.roll_number)
      .single();

    if (dbError || !dbRecord) {
      return new Response(JSON.stringify({ 
        verdict: 'NOT_FOUND', 
        message: `No certificate found with number: ${ocrData.roll_number}`,
        timestamp: new Date().toISOString(),
        test_mode: true
      }), {
        status: 200, // Return 200 instead of 404 for testing
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Core Verification Logic
    let isMatch = true;
    let confidenceScore = 0;
    const comparisonDetails = [];

    // Compare name (case-insensitive, trimmed)
    const expectedName = dbRecord.student_name?.trim().toLowerCase() || '';
    const foundName = ocrData.name?.trim().toLowerCase() || '';
    
    if (expectedName === foundName) {
      comparisonDetails.push({ field: 'name', status: 'MATCH' });
      confidenceScore += 30;
    } else if (foundName && (expectedName.includes(foundName) || foundName.includes(expectedName))) {
      comparisonDetails.push({ 
        field: 'name', 
        status: 'MISMATCH', 
        expected: dbRecord.student_name, 
        found: ocrData.name 
      });
      confidenceScore += 15; // Partial match
    } else {
      isMatch = false;
      comparisonDetails.push({ 
        field: 'name', 
        status: 'MISMATCH', 
        expected: dbRecord.student_name, 
        found: ocrData.name 
      });
    }
    
    // Compare marks
    const expectedMarks = dbRecord.marks?.trim() || '';
    const foundMarks = ocrData.marks?.trim() || '';
    
    if (expectedMarks === foundMarks) {
      comparisonDetails.push({ field: 'marks', status: 'MATCH' });
      confidenceScore += 25;
    } else if (foundMarks && (expectedMarks.includes(foundMarks) || foundMarks.includes(expectedMarks))) {
      comparisonDetails.push({ 
        field: 'marks', 
        status: 'MISMATCH', 
        expected: dbRecord.marks, 
        found: ocrData.marks 
      });
      confidenceScore += 10; // Partial match
    } else {
      isMatch = false;
      comparisonDetails.push({ 
        field: 'marks', 
        status: 'MISMATCH', 
        expected: dbRecord.marks, 
        found: ocrData.marks 
      });
    }

    // Determine final verdict
    let finalVerdict: 'VALID' | 'MISMATCH_FOUND' | 'SUSPICIOUS';
    
    if (isMatch && confidenceScore >= 70) {
      finalVerdict = 'VALID';
    } else if (confidenceScore >= 40) {
      finalVerdict = 'SUSPICIOUS';
    } else {
      finalVerdict = 'MISMATCH_FOUND';
    }

    const result: VerificationResult = {
      verdict: finalVerdict,
      details: comparisonDetails,
      confidence_score: Math.min(confidenceScore, 100),
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      status: 200, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Verification error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error during verification',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
})
