// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/verify/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    const { certificate_id } = await req.json();

    if (!certificate_id) {
      return new Response(JSON.stringify({ error: 'certificate_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a Supabase client with the correct permissions
    const supabaseClient = createClient(
      // Supabase API URL - Automatically set by the Deno runtime.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase ANON KEY - Automatically set by the Deno runtime.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Authorization header to bypass RLS
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Query your 'certificates' table
    const { data, error } = await supabaseClient
      .from('certificates')
      .select('*') // Select all columns for now
      .eq('id', certificate_id) // Find the row where 'id' matches the one from the request
      .single() // We expect only one result

    // Handle database errors
    if (error) {
      throw error;
    }
    
    // Return the certificate data as the response
    return new Response(JSON.stringify({ certificate: data }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500,
    })
  }
})
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/verify' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
