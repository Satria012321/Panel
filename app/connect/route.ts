import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const SECRET_KEY = "Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E";

function generateToken(game: string, userKey: string, serial: string): string {
  const auth = `${game}-${userKey}-${serial}-${SECRET_KEY}`;
  return crypto.createHash('md5').update(auth).digest('hex');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key') || searchParams.get('user_key');
  const game = searchParams.get('game') || 'MLBB';
  const serial = searchParams.get('serial') || '';

  if (!key) {
    return NextResponse.json({
      status: false,
      reason: 'Key parameter is required'
    });
  }

  return validateKey(key, game, serial);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let game = 'MLBB';
    let userKey = '';
    let serial = '';

    // Handle application/x-www-form-urlencoded
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      game = params.get('game') || 'MLBB';
      userKey = params.get('user_key') || params.get('key') || '';
      serial = params.get('serial') || '';
    } 
    // Handle application/json
    else {
      const body = await request.json();
      game = body.game || 'MLBB';
      userKey = body.user_key || body.key || body.license || '';
      serial = body.serial || '';
    }

    if (!userKey) {
      return NextResponse.json({
        status: false,
        reason: 'Key is required'
      });
    }

    return validateKey(userKey, game, serial);
  } catch (error) {
    return NextResponse.json({
      status: false,
      reason: 'Invalid request body'
    });
  }
}

async function validateKey(key: string, game: string, serial: string) {
  if (!supabase) {
    return NextResponse.json({
      status: false,
      reason: 'Database not connected'
    });
  }

  try {
    const { data: keyData, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('api_key', key)
      .single();

    if (error || !keyData) {
      return NextResponse.json({
        status: false,
        reason: 'Invalid key'
      });
    }

    if (!keyData.is_active) {
      return NextResponse.json({
        status: false,
        reason: 'Key has been disabled'
      });
    }

    // Check expiration
    let daysRemaining = -1; // -1 for lifetime
    
    if (keyData.expires_at) {
      const expiresAt = new Date(keyData.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        return NextResponse.json({
          status: false,
          reason: 'Key has expired'
        });
      }

      daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Check if serial is already bound to this key
    // Only check if key has a serial AND incoming serial is not empty AND they don't match
    if (keyData.serial_number && serial && keyData.serial_number !== serial) {
      return NextResponse.json({
        status: false,
        reason: 'Key is already bound to another device'
      });
    }

    // Bind serial to key if not already bound and serial is provided
    if (!keyData.serial_number && serial && serial.trim() !== '') {
      await supabase
        .from('api_keys')
        .update({ serial_number: serial })
        .eq('id', keyData.id);
    }

    // Generate token
    const token = generateToken(game, key, serial);
    const rng = Math.floor(Date.now() / 1000);

    return NextResponse.json({
      status: true,
      data: {
        token: token,
        rng: rng,
        days_remaining: daysRemaining,
        game: game,
        key: key
      }
    });

  } catch (error) {
    console.error('Validate key error:', error);
    return NextResponse.json({
      status: false,
      reason: 'Server error'
    });
  }
}
