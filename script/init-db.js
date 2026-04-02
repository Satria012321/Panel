import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'reseller')),
          balance BIGINT NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (usersError && !usersError.message.includes('already exists')) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✓ Users table ready');
    }

    // Create api_keys table
    const { error: keysError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS api_keys (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          key_type VARCHAR(20) NOT NULL CHECK (key_type IN ('CODM', 'MLBB', 'HOK', 'FF', 'PUBG', 'VAL', 'GI', 'AOV')),
          api_key VARCHAR(255) UNIQUE NOT NULL,
          serial_number VARCHAR(255) NOT NULL,
          days_valid INT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE,
          revoked_at TIMESTAMP WITH TIME ZONE NULL
        );
      `
    });

    if (keysError && !keysError.message.includes('already exists')) {
      console.error('Error creating api_keys table:', keysError);
    } else {
      console.log('✓ API keys table ready');
    }

    // Create invitations table
    const { error: invError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS invitations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          code VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'reseller')),
          is_used BOOLEAN DEFAULT FALSE,
          used_by UUID REFERENCES users(id),
          used_at TIMESTAMP WITH TIME ZONE NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE
        );
      `
    });

    if (invError && !invError.message.includes('already exists')) {
      console.error('Error creating invitations table:', invError);
    } else {
      console.log('✓ Invitations table ready');
    }

    // Create transactions table
    const { error: txError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount BIGINT NOT NULL,
          transaction_type VARCHAR(50) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (txError && !txError.message.includes('already exists')) {
      console.error('Error creating transactions table:', txError);
    } else {
      console.log('✓ Transactions table ready');
    }

    console.log('\n✓ Database initialization complete!');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

initDatabase();
