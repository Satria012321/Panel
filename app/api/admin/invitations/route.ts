import { NextRequest, NextResponse } from 'next/server';
import { supabase, verifyToken, getUserById, generateInvitationCode } from '@/lib/auth';

interface InvitationRequest {
  action: 'create' | 'list' | 'revoke';
  role?: 'owner' | 'admin' | 'reseller';
  expires_in_days?: number;
  invitation_code?: string;
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

    const body: InvitationRequest = await request.json();
    const { action, role, expires_in_days = 7, invitation_code } = body;

    // Action: Create invitation
    if (action === 'create') {
      // Only owner and admin can create invitations
      if (currentUser.role === 'reseller') {
        return NextResponse.json(
          { error: 'Resellers cannot create invitations' },
          { status: 403 }
        );
      }

      if (!role) {
        return NextResponse.json(
          { error: 'Role required' },
          { status: 400 }
        );
      }

      // Owner can create all roles, admin can only create reseller
      if (currentUser.role === 'admin' && role !== 'reseller') {
        return NextResponse.json(
          { error: 'Admin can only create reseller invitations' },
          { status: 403 }
        );
      }

      const code = generateInvitationCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in_days);

      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          created_by: currentUser.id,
          code,
          role,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create invitation' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          invitation: {
            code: invitation.code,
            role: invitation.role,
            created_at: invitation.created_at,
            expires_at: invitation.expires_at,
          },
        },
        { status: 201 }
      );
    }

    // Action: List invitations
    if (action === 'list') {
      let query = supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      // Resellers can't list invitations
      if (currentUser.role === 'reseller') {
        return NextResponse.json(
          { error: 'Resellers cannot list invitations' },
          { status: 403 }
        );
      }

      // Admins can only see their own invitations
      if (currentUser.role === 'admin') {
        query = query.eq('created_by', currentUser.id);
      }

      const { data: invitations, error } = await query;

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch invitations' },
          { status: 500 }
        );
      }

      return NextResponse.json({ invitations }, { status: 200 });
    }

    // Action: Revoke invitation
    if (action === 'revoke') {
      if (!invitation_code) {
        return NextResponse.json(
          { error: 'Invitation code required' },
          { status: 400 }
        );
      }

      // Get invitation
      const { data: invitation } = await supabase
        .from('invitations')
        .select('created_by')
        .eq('code', invitation_code)
        .single();

      if (!invitation) {
        return NextResponse.json(
          { error: 'Invitation not found' },
          { status: 404 }
        );
      }

      // Only creator or owner can revoke
      if (currentUser.role !== 'owner' && currentUser.id !== invitation.created_by) {
        return NextResponse.json(
          { error: 'You cannot revoke this invitation' },
          { status: 403 }
        );
      }

      const { error } = await supabase
        .from('invitations')
        .update({ expires_at: new Date().toISOString() })
        .eq('code', invitation_code);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to revoke invitation' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Invitation revoked' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
