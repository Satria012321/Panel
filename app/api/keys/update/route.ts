import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Days for each key type
const KEY_DAYS: Record<string, number | null> = {
  '1day': 1,
  '7days': 7,
  '30days': 30,
  'lifetime': null,
};

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

    const userId = decoded.sub;
    const userRole = decoded.role;

    if (!supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }

    const body = await request.json();
    const { action, keyId, newDuration } = body;

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Get key to check ownership
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .single();

    if (keyError || !keyData) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    // Check ownership (owner/admin can edit all, others only their own)
    const isAdmin = ['owner', 'admin'].includes(userRole);
    if (!isAdmin && keyData.owner_id !== userId) {
      return NextResponse.json({ error: 'Not authorized to modify this key' }, { status: 403 });
    }

    if (action === 'delete') {
      const { error: deleteError } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Key deleted successfully' });
    }

    if (action === 'update_duration') {
      if (!newDuration || !KEY_DAYS.hasOwnProperty(newDuration)) {
        return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
      }

      const days = KEY_DAYS[newDuration];
      const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null;

      // Extract game from key_type (e.g., "MLBB-7days" -> "MLBB")
      const game = keyData.key_type.split('-')[0];
      const newKeyType = `${game}-${newDuration}`;

      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ 
          expires_at: expiresAt,
          key_type: newKeyType
        })
        .eq('id', keyId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update key' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Duration updated successfully',
        new_expires_at: expiresAt
      });
    }

    if (action === 'reset_device') {
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ serial_number: null })
        .eq('id', keyId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to reset device' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Device binding reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Update key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
