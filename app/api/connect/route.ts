import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateApiKey, hashPassword } from '@/lib/auth';

const GAME_TYPES = ['CODM', 'MLBB', 'HOK', 'FF', 'PUBG', 'VAL', 'GI', 'AOV'];

interface ConnectRequest {
  action: 'validate' | 'generate' | 'revoke' | 'check';
  api_key?: string;
  serial_number?: string;
  key_type?: string;
  days_valid?: number;
  user_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body: ConnectRequest = await request.json();
    const { action, api_key, serial_number, key_type, days_valid, user_id } = body;

    // Validate action
    if (!action) {
      return NextResponse.json(
        { error: 'Action required' },
        { status: 400 }
      );
    }

    // Action: Validate API Key
    if (action === 'validate') {
      if (!api_key || !serial_number || !key_type) {
        return NextResponse.json(
          { error: 'api_key, serial_number, and key_type required' },
          { status: 400 }
        );
      }

      if (!GAME_TYPES.includes(key_type)) {
        return NextResponse.json(
          { error: `Invalid key_type. Allowed: ${GAME_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      // Query database for the key
      const { data: keyData, error } = await supabase
        .from('api_keys')
        .select('*, users(username, role)')
        .eq('api_key', api_key)
        .eq('serial_number', serial_number)
        .eq('key_type', key_type)
        .eq('is_active', true)
        .single();

      if (error || !keyData) {
        return NextResponse.json(
          { 
            valid: false, 
            message: 'Invalid API key, serial number, or key type combination',
            status: 'INVALID'
          },
          { status: 401 }
        );
      }

      // Check if key has expired
      const expiresAt = new Date(keyData.expires_at);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        return NextResponse.json(
          { 
            valid: false, 
            message: 'API key has expired',
            status: 'EXPIRED'
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          valid: true,
          status: 'VALID',
          game_type: keyData.key_type,
          days_remaining: daysRemaining,
          expires_at: keyData.expires_at,
          created_at: keyData.created_at,
        },
        { status: 200 }
      );
    }

    // Action: Generate API Key
    if (action === 'generate') {
      if (!user_id || !key_type || !days_valid) {
        return NextResponse.json(
          { error: 'user_id, key_type, and days_valid required' },
          { status: 400 }
        );
      }

      if (!GAME_TYPES.includes(key_type)) {
        return NextResponse.json(
          { error: `Invalid key_type. Allowed: ${GAME_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      if (days_valid <= 0) {
        return NextResponse.json(
          { error: 'days_valid must be greater than 0' },
          { status: 400 }
        );
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', user_id)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Generate key and serial number
      const newKey = generateApiKey();
      const serialNumber = `${key_type}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days_valid);

      // Insert into database
      const { data: insertedKey, error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id,
          key_type,
          api_key: newKey,
          serial_number: serialNumber,
          days_valid,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to generate API key' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          key_id: insertedKey.id,
          api_key: newKey,
          serial_number: serialNumber,
          key_type,
          days_valid,
          expires_at: insertedKey.expires_at,
        },
        { status: 201 }
      );
    }

    // Action: Revoke API Key
    if (action === 'revoke') {
      if (!api_key) {
        return NextResponse.json(
          { error: 'api_key required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('api_key', api_key);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to revoke API key' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'API key revoked' },
        { status: 200 }
      );
    }

    // Action: Check key status
    if (action === 'check') {
      if (!api_key) {
        return NextResponse.json(
          { error: 'api_key required' },
          { status: 400 }
        );
      }

      const { data: keyData, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('api_key', api_key)
        .single();

      if (error || !keyData) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }

      const expiresAt = new Date(keyData.expires_at);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return NextResponse.json(
        {
          api_key: keyData.api_key,
          key_type: keyData.key_type,
          serial_number: keyData.serial_number,
          is_active: keyData.is_active,
          days_remaining: daysRemaining,
          created_at: keyData.created_at,
          expires_at: keyData.expires_at,
          revoked_at: keyData.revoked_at,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'Key Generator API Server',
      endpoints: {
        '/api/connect': 'POST',
        '/api/auth/login': 'POST',
        '/api/auth/register': 'POST',
        '/api/admin/users': 'GET',
        '/api/admin/balance': 'POST',
      },
      game_types: GAME_TYPES,
    }
  );
}
