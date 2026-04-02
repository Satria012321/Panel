/**
 * API Client for Key Generator Server
 * Usage example for integrating with the key generator server
 */

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
  [key: string]: any;
}

class KeyGeneratorClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Authentication

  async login(username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(
    username: string,
    password: string,
    invitationCode: string
  ) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        invitation_code: invitationCode,
      }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Key Management (/connect endpoint)

  async validateKey(
    apiKey: string,
    serialNumber: string,
    keyType: string
  ) {
    return this.request('/connect', {
      method: 'POST',
      body: JSON.stringify({
        action: 'validate',
        api_key: apiKey,
        serial_number: serialNumber,
        key_type: keyType,
      }),
    });
  }

  async generateKey(
    userId: string,
    keyType: string,
    daysValid: number
  ) {
    return this.request('/connect', {
      method: 'POST',
      body: JSON.stringify({
        action: 'generate',
        user_id: userId,
        key_type: keyType,
        days_valid: daysValid,
      }),
    });
  }

  async checkKeyStatus(apiKey: string) {
    return this.request('/connect', {
      method: 'POST',
      body: JSON.stringify({
        action: 'check',
        api_key: apiKey,
      }),
    });
  }

  async revokeKey(apiKey: string) {
    return this.request('/connect', {
      method: 'POST',
      body: JSON.stringify({
        action: 'revoke',
        api_key: apiKey,
      }),
    });
  }

  // User Management

  async getUsers() {
    return this.request('/admin/users', {
      method: 'GET',
    });
  }

  // Balance Management

  async setBalance(userId: string, amount: number) {
    return this.request('/admin/balance', {
      method: 'POST',
      body: JSON.stringify({
        action: 'set',
        target_user_id: userId,
        amount,
      }),
    });
  }

  async addBalance(userId: string, amount: number) {
    return this.request('/admin/balance', {
      method: 'POST',
      body: JSON.stringify({
        action: 'add',
        target_user_id: userId,
        amount,
      }),
    });
  }

  async deductBalance(userId: string, amount: number) {
    return this.request('/admin/balance', {
      method: 'POST',
      body: JSON.stringify({
        action: 'deduct',
        target_user_id: userId,
        amount,
      }),
    });
  }

  async transferBalance(
    fromUserId: string,
    toUserId: string,
    amount: number
  ) {
    return this.request('/admin/balance', {
      method: 'POST',
      body: JSON.stringify({
        action: 'transfer',
        target_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
      }),
    });
  }

  // Role Management

  async changeUserRole(userId: string, newRole: string) {
    return this.request('/admin/role', {
      method: 'POST',
      body: JSON.stringify({
        target_user_id: userId,
        new_role: newRole,
      }),
    });
  }

  // Invitation Management

  async createInvitation(role: string, expiresInDays?: number) {
    return this.request('/admin/invitations', {
      method: 'POST',
      body: JSON.stringify({
        action: 'create',
        role,
        expires_in_days: expiresInDays || 7,
      }),
    });
  }

  async listInvitations() {
    return this.request('/admin/invitations', {
      method: 'POST',
      body: JSON.stringify({
        action: 'list',
      }),
    });
  }

  async revokeInvitation(code: string) {
    return this.request('/admin/invitations', {
      method: 'POST',
      body: JSON.stringify({
        action: 'revoke',
        invitation_code: code,
      }),
    });
  }

  // Utility methods

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export default KeyGeneratorClient;

/**
 * Usage Example:
 *
 * const client = new KeyGeneratorClient('https://yourdomain.com/api');
 *
 * // Login
 * const loginResult = await client.login('username', 'password');
 * if (loginResult.error) {
 *   console.error('Login failed:', loginResult.error);
 *   return;
 * }
 *
 * // Generate API key
 * const keyResult = await client.generateKey('user_id', 'CODM', 30);
 * console.log('Generated key:', keyResult);
 *
 * // Validate key
 * const validResult = await client.validateKey(
 *   'api_key_hex',
 *   'CODM-xxx-xxx',
 *   'CODM'
 * );
 * console.log('Key is valid:', validResult.valid);
 *
 * // Add balance to user
 * const balanceResult = await client.addBalance('user_id', 1000000);
 * console.log('New balance:', balanceResult.new_balance);
 *
 * // Logout
 * client.logout();
 */
  
