import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const jwtSecret = process.env.SUPABASE_JWT_SECRET || 'your-secret-key';

// Only create Supabase client if credentials are available
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface User {
  id: string;
  username: string;
  role: 'owner' | 'admin' | 'reseller';
  balance: number;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_type: string;
  api_key: string;
  serial_number: string;
  days_valid: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

// Hash password using SHA256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate random API key
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate random invitation code
export function generateInvitationCode(): string {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
}

// Generate JWT token
export function generateToken(userId: string, username: string, role: string): string {
  return jwt.sign(
    { sub: userId, username, role },
    jwtSecret,
    { expiresIn: '30d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
}

// Register new user
export async function registerUser(
  username: string,
  password: string,
  role: 'reseller' | 'admin' | 'owner' = 'reseller'
): Promise<{ user: User; token: string } | null> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    const passwordHash = hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        role,
        balance: role === 'reseller' ? 0 : 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Register error:', error);
      return null;
    }

    const token = generateToken(data.id, data.username, data.role);
    return { user: data, token };
  } catch (error) {
    console.error('Register error:', error);
    return null;
  }
}

// Login user
export async function loginUser(
  username: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    const passwordHash = hashPassword(password);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return null;
    }

    if (data.password_hash !== passwordHash) {
      return null;
    }

    const token = generateToken(data.id, data.username, data.role);
    return { user: data, token };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return error ? null : data;
  } catch (error) {
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    return error ? null : data;
  } catch (error) {
    return null;
  }
}

// Change user password
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Database not connected' };
    }

    // Get user and verify current password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return { success: false, error: 'User not found' };
    }

    const currentHash = hashPassword(currentPassword);
    if (user.password_hash !== currentHash) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    const newHash = hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'An error occurred' };
  }
}
