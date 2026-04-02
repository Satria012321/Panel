import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateInvitationCode() {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
}

async function createOwnerAccount() {
  try {
    console.log('\n🔧 Creating Owner Account...\n');

    const username = 'owner';
    const password = 'owner123';
    const passwordHash = hashPassword(password);

    // Check if owner already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      console.log('⚠️  Owner account already exists!');
      console.log('\n📋 Owner Login Credentials:');
      console.log('   Username: owner');
      console.log('   Password: owner123');
      
      // Generate a new invitation code for this owner
      const inviteCode = generateInvitationCode();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

      const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
          created_by: existingUser.id,
          code: inviteCode,
          role: 'reseller',
          is_used: false,
          expires_at: expiresAt,
        });

      if (inviteError) {
        console.error('❌ Error creating invitation:', inviteError);
        process.exit(1);
      }

      console.log('\n🎟️  Invitation Code for You (Reseller):');
      console.log('   Code: ' + inviteCode);
      console.log('   Role: Reseller');
      console.log('   Expires: ' + new Date(expiresAt).toLocaleString());
      console.log('\n✅ All set! You can now register using this code.\n');
      return;
    }

    // Create owner account
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        role: 'owner',
        balance: 999999999999999, // Unlimited for owner
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating owner account:', createError);
      process.exit(1);
    }

    console.log('✅ Owner account created successfully!');
    console.log('\n📋 Owner Login Credentials:');
    console.log('   Username: owner');
    console.log('   Password: owner123');

    // Create invitation code for user
    const inviteCode = generateInvitationCode();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const { error: inviteError } = await supabase
      .from('invitations')
      .insert({
        created_by: newUser.id,
        code: inviteCode,
        role: 'reseller',
        is_used: false,
        expires_at: expiresAt,
      });

    if (inviteError) {
      console.error('❌ Error creating invitation:', inviteError);
      process.exit(1);
    }

    console.log('\n🎟️  Invitation Code for You (Reseller):');
    console.log('   Code: ' + inviteCode);
    console.log('   Role: Reseller');
    console.log('   Expires: ' + new Date(expiresAt).toLocaleString());

    console.log('\n📝 Next Steps:');
    console.log('   1. Go to the app (http://localhost:3000)');
    console.log('   2. Click "Register" tab');
    console.log('   3. Enter your desired username and password');
    console.log('   4. Enter the invitation code: ' + inviteCode);
    console.log('   5. Click "Register"');
    console.log('\n✅ All set! Start using the app now!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createOwnerAccount();
