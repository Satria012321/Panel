import { NextRequest, NextResponse } from 'next/server';
import { supabase, verifyToken, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Check if user is owner or admin
    const user = await getUserById(decoded.sub);
    if (!user || !['owner', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Owner or Admin required' },
        { status: 403 }
      );
    }

    // Fetch all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, balance, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
