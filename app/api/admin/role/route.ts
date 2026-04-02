import { NextRequest, NextResponse } from 'next/server';
import { supabase, verifyToken, getUserById } from '@/lib/auth';

interface RoleRequest {
  target_user_id: string;
  new_role: 'owner' | 'admin' | 'reseller';
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = await getUserById(decoded.sub);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body: RoleRequest = await request.json();
    const { target_user_id, new_role } = body;

    if (!target_user_id || !new_role) {
      return NextResponse.json(
        { error: 'target_user_id and new_role required' },
        { status: 400 }
      );
    }

    // Only owner can change roles
    if (currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owner can change user roles' },
        { status: 403 }
      );
    }

    // Get target user
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', target_user_id)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Cannot change owner's role
    if (targetUser.role === 'owner' && new_role !== 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 403 }
      );
    }

    // Update role
    const { error } = await supabase
      .from('users')
      .update({ role: new_role })
      .eq('id', target_user_id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    // Record transaction log
    await supabase.from('transactions').insert({
      from_user_id: currentUser.id,
      to_user_id: target_user_id,
      amount: 0,
      transaction_type: 'ROLE_CHANGED',
      description: `Role changed from ${targetUser.role} to ${new_role}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Role changed to ${new_role}`,
        old_role: targetUser.role,
        new_role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
