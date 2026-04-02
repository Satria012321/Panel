import { NextRequest, NextResponse } from 'next/server';
import { registerUser, supabase, generateInvitationCode } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { username, password, invitation_code } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    if (!invitation_code) {
      return NextResponse.json(
        { error: 'Invitation code required' },
        { status: 400 }
      );
    }

    // Verify invitation code
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*')
      .eq('code', invitation_code)
      .eq('is_used', false)
      .single();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or already used invitation code' },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation code has expired' },
        { status: 400 }
      );
    }

    // Register user with the role from invitation
    const result = await registerUser(username, password, invitation.role);

    if (!result) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Mark invitation as used
    await supabase
      .from('invitations')
      .update({
        is_used: true,
        used_by: result.user.id,
        used_at: new Date().toISOString(),
      })
      .eq('code', invitation_code);

    return NextResponse.json(
      {
        success: true,
        user: result.user,
        token: result.token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
