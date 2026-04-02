import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.sub;

    if (!supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    let query = supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    // If not owner/admin, only show their own keys
    if (userData?.role !== 'owner' && userData?.role !== 'admin') {
      query = query.eq('owner_id', userId);
    }

    const { data: keys, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
    }

    // Calculate days remaining for each key
    const keysWithDays = keys?.map(key => {
      let days_remaining = null;
      if (key.expires_at) {
        const expiresAt = new Date(key.expires_at);
        const now = new Date();
        days_remaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days_remaining < 0) days_remaining = 0;
      } else {
        days_remaining = -1; // Lifetime
      }
      return { ...key, days_remaining };
    }) || [];

    return NextResponse.json({ keys: keysWithDays });

  } catch (error) {
    console.error('List keys error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
