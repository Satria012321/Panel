import { NextRequest, NextResponse } from 'next/server';
import { supabase, verifyToken, getUserById } from '@/lib/auth';

interface BalanceRequest {
  action: 'set' | 'add' | 'deduct' | 'transfer';
  target_user_id: string;
  amount?: number;
  to_user_id?: string;
}

const MAX_RESELLER_BALANCE = BigInt('9999999999999999');

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

    const body: BalanceRequest = await request.json();
    const { action, target_user_id, amount, to_user_id } = body;

    // Get target user
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, role, balance')
      .eq('id', target_user_id)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Action: Set balance
    if (action === 'set') {
      // Only owner can set balance for any user
      if (currentUser.role !== 'owner') {
        return NextResponse.json(
          { error: 'Only owner can set balance' },
          { status: 403 }
        );
      }

      if (amount === undefined || amount < 0) {
        return NextResponse.json(
          { error: 'Valid amount required' },
          { status: 400 }
        );
      }

      // Check max balance for reseller
      if (targetUser.role === 'reseller' && amount > Number(MAX_RESELLER_BALANCE)) {
        return NextResponse.json(
          { error: `Reseller balance cannot exceed ${MAX_RESELLER_BALANCE}` },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('users')
        .update({ balance: amount })
        .eq('id', target_user_id);

      if (error) {
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
      }

      // Record transaction
      await supabase.from('transactions').insert({
        from_user_id: currentUser.id,
        to_user_id: target_user_id,
        amount,
        transaction_type: 'BALANCE_SET',
        description: `Balance set to ${amount}`,
      });

      return NextResponse.json(
        { success: true, message: 'Balance updated', new_balance: amount },
        { status: 200 }
      );
    }

    // Action: Add balance
    if (action === 'add') {
      if (!['owner', 'admin'].includes(currentUser.role)) {
        return NextResponse.json(
          { error: 'Only owner or admin can add balance' },
          { status: 403 }
        );
      }

      if (amount === undefined || amount <= 0) {
        return NextResponse.json(
          { error: 'Valid positive amount required' },
          { status: 400 }
        );
      }

      const newBalance = BigInt(targetUser.balance.toString()) + BigInt(amount.toString());

      // Check max balance for reseller
      if (targetUser.role === 'reseller' && newBalance > MAX_RESELLER_BALANCE) {
        return NextResponse.json(
          { error: `Reseller balance cannot exceed ${MAX_RESELLER_BALANCE}` },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance.toString() })
        .eq('id', target_user_id);

      if (error) {
        return NextResponse.json({ error: 'Failed to add balance' }, { status: 500 });
      }

      // Record transaction
      await supabase.from('transactions').insert({
        from_user_id: currentUser.id,
        to_user_id: target_user_id,
        amount,
        transaction_type: 'BALANCE_ADD',
        description: `Added balance: +${amount}`,
      });

      return NextResponse.json(
        { success: true, message: 'Balance added', new_balance: newBalance.toString() },
        { status: 200 }
      );
    }

    // Action: Deduct balance
    if (action === 'deduct') {
      if (!['owner', 'admin'].includes(currentUser.role)) {
        return NextResponse.json(
          { error: 'Only owner or admin can deduct balance' },
          { status: 403 }
        );
      }

      if (amount === undefined || amount <= 0) {
        return NextResponse.json(
          { error: 'Valid positive amount required' },
          { status: 400 }
        );
      }

      const newBalance = BigInt(targetUser.balance.toString()) - BigInt(amount.toString());

      if (newBalance < 0n) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance.toString() })
        .eq('id', target_user_id);

      if (error) {
        return NextResponse.json({ error: 'Failed to deduct balance' }, { status: 500 });
      }

      // Record transaction
      await supabase.from('transactions').insert({
        from_user_id: currentUser.id,
        to_user_id: target_user_id,
        amount,
        transaction_type: 'BALANCE_DEDUCT',
        description: `Deducted balance: -${amount}`,
      });

      return NextResponse.json(
        { success: true, message: 'Balance deducted', new_balance: newBalance.toString() },
        { status: 200 }
      );
    }

    // Action: Transfer balance between users
    if (action === 'transfer') {
      if (!to_user_id) {
        return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
      }

      if (amount === undefined || amount <= 0) {
        return NextResponse.json(
          { error: 'Valid positive amount required' },
          { status: 400 }
        );
      }

      // Only owner and admin can transfer
      if (!['owner', 'admin'].includes(currentUser.role)) {
        return NextResponse.json(
          { error: 'Transfer not allowed' },
          { status: 403 }
        );
      }

      // Get recipient
      const { data: recipient } = await supabase
        .from('users')
        .select('id, role, balance')
        .eq('id', to_user_id)
        .single();

      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }

      const fromBalance = BigInt(currentUser.balance.toString()) - BigInt(amount.toString());
      const toBalance = BigInt(recipient.balance.toString()) + BigInt(amount.toString());

      if (fromBalance < 0n) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      // Check max balance for reseller
      if (recipient.role === 'reseller' && toBalance > MAX_RESELLER_BALANCE) {
        return NextResponse.json(
          { error: `Recipient balance cannot exceed ${MAX_RESELLER_BALANCE}` },
          { status: 400 }
        );
      }

      // Update both balances
      await supabase
        .from('users')
        .update({ balance: fromBalance.toString() })
        .eq('id', currentUser.id);

      await supabase
        .from('users')
        .update({ balance: toBalance.toString() })
        .eq('id', to_user_id);

      // Record transaction
      await supabase.from('transactions').insert({
        from_user_id: currentUser.id,
        to_user_id,
        amount,
        transaction_type: 'BALANCE_TRANSFER',
        description: `Transferred balance: ${amount}`,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Balance transferred',
          from_balance: fromBalance.toString(),
          to_balance: toBalance.toString(),
        },
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
