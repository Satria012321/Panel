import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';

// Simple key validation endpoint
// POST /api/validate with { "key": "MLBB-XXXX-XXXX-XXXX-XXXX" }
// or GET /api/validate?key=MLBB-XXXX-XXXX-XXXX-XXXX

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const key = body.key || body.api_key;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key is required' },
        { status: 400 }
      );
    }

    return await validateKey(key);
  } catch (error) {
    console.error('Validate error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    return await validateKey(key);
  } catch (error) {
    console.error('Validate error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function validateKey(key: string) {
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Database not connected' },
      { status: 503 }
    );
  }

  // Query database for the key
  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('api_key', key)
    .eq('is_active', true)
    .single();

  if (error || !keyData) {
    return NextResponse.json(
      { 
        success: false,
        valid: false, 
        message: 'Invalid or inactive key',
        status: 'INVALID'
      },
      { status: 401 }
    );
  }

  // Check if key has expired
  const expiresAt = keyData.expires_at ? new Date(keyData.expires_at) : null;
  const now = new Date();
  
  let daysRemaining = -1;
  let isExpired = false;
  
  if (expiresAt) {
    daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isExpired = daysRemaining <= 0;
  } else {
    // Lifetime key
    daysRemaining = 9999;
  }

  if (isExpired) {
    return NextResponse.json(
      { 
        success: false,
        valid: false, 
        message: 'Key has expired',
        status: 'EXPIRED'
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      valid: true,
      status: 'VALID',
      key: keyData.api_key,
      game: keyData.key_type,
      serial_number: keyData.serial_number,
      days_remaining: daysRemaining,
      expires_at: keyData.expires_at,
      created_at: keyData.created_at,
    },
    { status: 200 }
  );
}
