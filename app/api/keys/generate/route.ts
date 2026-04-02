import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Price per key type
const KEY_PRICES: Record<string, number> = {
  '1day': 1000,
  '7days': 5000,
  '30days': 15000,
  'lifetime': 50000,
};

// Days for each key type
const KEY_DAYS: Record<string, number | null> = {
  '1day': 1,
  '7days': 7,
  '30days': 30,
  'lifetime': null, // null means no expiration
};

function generateRandomKey(game: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = game + '-';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) key += '-';
  }
  return key;
}



export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Token uses 'sub' for userId
    const userId = decoded.sub;

    if (!supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const body = await request.json();
    const { game, keyType, quantity = 1, customKey } = body;

    if (!game || !keyType) {
      return NextResponse.json({ error: 'Game and key type are required' }, { status: 400 });
    }

    const validGames = ['CODM', 'MLBB', 'HOK', 'FF', 'PUBG', 'VAL', 'GI', 'AOV'];
    if (!validGames.includes(game)) {
      return NextResponse.json({ error: 'Invalid game type' }, { status: 400 });
    }

    if (!KEY_PRICES[keyType]) {
      return NextResponse.json({ error: 'Invalid key type' }, { status: 400 });
    }

    // If custom key provided, validate and check if it already exists
    if (customKey) {
      if (customKey.length < 5) {
        return NextResponse.json({ error: 'Custom key must be at least 5 characters' }, { status: 400 });
      }
      
      const { data: existingKey } = await supabase
        .from('api_keys')
        .select('id')
        .eq('api_key', customKey)
        .single();
      
      if (existingKey) {
        return NextResponse.json({ error: 'Custom key already exists' }, { status: 400 });
      }
    }

    const actualQuantity = customKey ? 1 : quantity;
    if (actualQuantity < 1 || actualQuantity > 10) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 10' }, { status: 400 });
    }

    // Get user's current balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance, role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalCost = KEY_PRICES[keyType] * actualQuantity;
    const isUnlimited = ['owner', 'admin'].includes(userData.role);

    // Check balance for resellers
    if (!isUnlimited && userData.balance < totalCost) {
      return NextResponse.json({ 
        error: `Insufficient balance. Need ${totalCost}, have ${userData.balance}` 
      }, { status: 400 });
    }

    // Generate keys
    const keys: string[] = [];
    const keysToInsert = [];
    const days = KEY_DAYS[keyType];
    const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;

    for (let i = 0; i < actualQuantity; i++) {
      // Use custom key if provided, otherwise generate random
      const apiKey = customKey ? customKey : generateRandomKey(game);
      keys.push(apiKey);
      keysToInsert.push({
        key_type: `${game}-${keyType}`,
        api_key: apiKey,
        serial_number: null, // Will be set when device first connects
        is_active: true,
        owner_id: userId,
        expires_at: expiresAt,
      });
    }

    // Insert keys
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert(keysToInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to generate keys' }, { status: 500 });
    }

    // Deduct balance for resellers
    if (!isUnlimited) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: userData.balance - totalCost })
        .eq('id', userId);

      if (updateError) {
        console.error('Balance update error:', updateError);
      }
    }

    return NextResponse.json({ 
      success: true,
      keys,
      quantity: keys.length,
      cost: isUnlimited ? 0 : totalCost,
    });
  } catch (error) {
    console.error('Generate key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
