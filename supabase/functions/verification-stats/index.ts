// AUTHENTO - Verification Statistics Endpoint
// Provides analytics and statistics for verification attempts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface VerificationStats {
  total_verifications: number;
  valid_count: number;
  fake_count: number;
  suspicious_count: number;
  not_found_count: number;
  success_rate: number;
  recent_verifications: Array<{
    id: string;
    certificate_number: string;
    result: string;
    timestamp: string;
    confidence_score?: number;
  }>;
  daily_stats: Array<{
    date: string;
    total: number;
    valid: number;
    fake: number;
    suspicious: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    })
  }

  try {
    // Validate request method
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed. Only GET requests are accepted.' 
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check user role
    const { data: userData } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'employer')) {
      return new Response(JSON.stringify({ 
        error: 'Access denied. Admin or employer role required.' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Get query parameters
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const employerId = userData.role === 'admin' ? null : user.id;

    // Get overall statistics
    const { data: stats } = await supabaseClient
      .rpc('get_verification_stats', { employer_id: employerId });

    // Get recent verifications
    const { data: recentVerifications } = await supabaseClient
      .from('verificationlogs')
      .select(`
        id,
        result,
        timestamp,
        confidence_score,
        certificates!inner(certificate_number)
      `)
      .eq(employerId ? 'employer_id' : 'id', employerId || '')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get daily statistics for the last N days
    const { data: dailyStats } = await supabaseClient
      .from('verificationlogs')
      .select('result, timestamp')
      .eq(employerId ? 'employer_id' : 'id', employerId || '')
      .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    // Process daily stats
    const dailyStatsMap = new Map();
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyStatsMap.set(dateStr, { date: dateStr, total: 0, valid: 0, fake: 0, suspicious: 0 });
    }

    if (dailyStats) {
      dailyStats.forEach(stat => {
        const dateStr = stat.timestamp.split('T')[0];
        if (dailyStatsMap.has(dateStr)) {
          const dayStat = dailyStatsMap.get(dateStr);
          dayStat.total++;
          if (stat.result === 'valid') dayStat.valid++;
          else if (stat.result === 'fake') dayStat.fake++;
          else if (stat.result === 'suspicious') dayStat.suspicious++;
        }
      });
    }

    const result: VerificationStats = {
      total_verifications: stats?.[0]?.total_verifications || 0,
      valid_count: stats?.[0]?.valid_count || 0,
      fake_count: stats?.[0]?.fake_count || 0,
      suspicious_count: stats?.[0]?.suspicious_count || 0,
      not_found_count: stats?.[0]?.not_found_count || 0,
      success_rate: stats?.[0]?.total_verifications > 0 
        ? ((stats[0].valid_count / stats[0].total_verifications) * 100).toFixed(2)
        : 0,
      recent_verifications: recentVerifications?.map(v => ({
        id: v.id,
        certificate_number: v.certificates?.certificate_number || 'N/A',
        result: v.result,
        timestamp: v.timestamp,
        confidence_score: v.confidence_score
      })) || [],
      daily_stats: Array.from(dailyStatsMap.values()).reverse()
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Stats error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error while fetching statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
})
