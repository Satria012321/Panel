'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Copy, LogOut, Key, Users, Wallet, Gift, AlertCircle, Trash2, Plus, Clock, CheckCircle, XCircle, Settings, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  username: string;
  role: string;
  balance: number;
}

interface ApiKey {
  id: string;
  key_type: string;
  api_key: string;
  serial_number: string | null;
  is_active: boolean;
  days_remaining?: number | null;
  expires_at?: string | null;
}

interface Invitation {
  id: string;
  code: string;
  role: string;
  created_by: string;
  is_used: boolean;
  used_by?: string;
  used_at?: string;
  created_at: string;
  expires_at: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginError, setLoginError] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', inviteCode: '' });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [createInviteForm, setCreateInviteForm] = useState({
    role: 'reseller' as 'owner' | 'admin' | 'reseller',
    expires_in_days: 7,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [generateKeyForm, setGenerateKeyForm] = useState({
    game: 'CODM',
    keyType: '1day',
    quantity: 1,
    customKey: '',
    useCustomKey: false,
  });
  const [generateKeyLoading, setGenerateKeyLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      setShowLogin(false);
      loadApiKeys(savedToken);
      if (['owner', 'admin'].includes(parsedUser.role)) {
        loadInvitations(savedToken);
      }
    }
  }, []);

  const loadApiKeys = async (authToken: string) => {
    try {
      const res = await fetch('/api/keys/list', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.keys) {
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const loadInvitations = async (authToken: string) => {
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ action: 'list' }),
      });

      const data = await res.json();
      if (res.ok && data.invitations) {
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const createInvitation = async () => {
    if (!token) return;
    setInvitationLoading(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create',
          role: createInviteForm.role,
          expires_in_days: createInviteForm.expires_in_days,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', description: data.error || 'Failed to create invitation' });
        return;
      }

      toast({ description: `Invitation code created: ${data.invitation.code}` });
      loadInvitations(token);
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to create invitation' });
    } finally {
      setInvitationLoading(false);
    }
  };

  const revokeInvitation = async (code: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'revoke',
          invitation_code: code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', description: data.error || 'Failed to revoke invitation' });
        return;
      }

      toast({ description: 'Invitation revoked successfully' });
      loadInvitations(token);
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to revoke invitation' });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/keys/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'delete', keyId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', description: data.error || 'Failed to delete key' });
        return;
      }

      toast({ description: 'Key deleted successfully' });
      loadApiKeys(token);
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to delete key' });
    }
  };

  const handleUpdateKeyDuration = async (keyId: string, newDuration: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/keys/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'update_duration', keyId, newDuration }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', description: data.error || 'Failed to update key' });
        return;
      }

      toast({ description: 'Duration updated successfully' });
      loadApiKeys(token);
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to update key' });
    }
  };

  const handleResetDevice = async (keyId: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/keys/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reset_device', keyId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', description: data.error || 'Failed to reset device' });
        return;
      }

      toast({ description: 'Device binding reset successfully' });
      loadApiKeys(token);
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to reset device' });
    }
  };

  const handleGenerateKey = async () => {
    if (!token) return;
    
    // Validate custom key if used
    if (generateKeyForm.useCustomKey && !generateKeyForm.customKey.trim()) {
      toast({ variant: 'destructive', description: 'Please enter a custom key' });
      return;
    }
    
    setGenerateKeyLoading(true);
    setGeneratedKeys([]);
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          game: generateKeyForm.game,
          keyType: generateKeyForm.keyType,
          quantity: generateKeyForm.useCustomKey ? 1 : generateKeyForm.quantity,
          customKey: generateKeyForm.useCustomKey ? generateKeyForm.customKey.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', description: data.error || 'Failed to generate keys' });
        return;
      }

      setGeneratedKeys(data.keys);
      toast({ description: `Successfully generated ${data.keys.length} key(s)!` });
      loadApiKeys(token);
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to generate keys' });
    } finally {
      setGenerateKeyLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ variant: 'destructive', description: 'New passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ variant: 'destructive', description: 'Password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', description: data.error || 'Failed to change password' });
        return;
      }

      toast({ description: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({ variant: 'destructive', description: 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.error || 'Login failed. Please try again.';
        setLoginError(errorMsg);
        toast({ variant: 'destructive', description: errorMsg });
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setToken(data.token);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      setLoginError('');
      toast({ description: 'Login successful!' });
    } catch (error: any) {
      const errorMsg = error.message || 'Network error. Please try again.';
      setLoginError(errorMsg);
      toast({ variant: 'destructive', description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRegisterError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Registration failed. Please try again.';
        setRegisterError(errorMsg);
        toast({ variant: 'destructive', description: errorMsg });
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setToken(data.token);
      setShowLogin(false);
      setRegisterForm({ username: '', password: '', inviteCode: '' });
      setRegisterError('');
      toast({ description: 'Registration successful!' });
    } catch (error: any) {
      const errorMsg = error.message || 'Network error. Please try again.';
      setRegisterError(errorMsg);
      toast({ variant: 'destructive', description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
    setShowLogin(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: 'Copied to clipboard!' });
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-500">{loginError}</AlertDescription>
                      </Alert>
                    )}
                    <div>
                      <label className="text-sm font-medium text-slate-300">Username</label>
                      <Input
                        placeholder="Enter username"
                        value={loginForm.username}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, username: e.target.value })
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Password</label>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, password: e.target.value })
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Need an invitation code to register</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {registerError && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-500">{registerError}</AlertDescription>
                      </Alert>
                    )}
                    <div>
                      <label className="text-sm font-medium text-slate-300">Invitation Code</label>
                      <Input
                        placeholder="Enter invitation code"
                        value={registerForm.inviteCode}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, inviteCode: e.target.value })
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Username</label>
                      <Input
                        placeholder="Choose username"
                        value={registerForm.username}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, username: e.target.value })
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Password</label>
                      <Input
                        type="password"
                        placeholder="Choose password"
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, password: e.target.value })
                        }
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Registering...' : 'Register'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Key Generator</h1>
            <p className="text-slate-400">Welcome, {user?.username}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
<TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="home">Home</TabsTrigger>
                {['owner', 'admin'].includes(user?.role || '') && (
                  <>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="invitations">Invitations</TabsTrigger>
                  </>
                )}
                <TabsTrigger value="keys">My Keys</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

          {/* Home Tab */}
          <TabsContent value="home">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Username</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.username}</div>
                  <p className="text-xs text-slate-400">Account name</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{user?.role}</div>
                  <p className="text-xs text-slate-400">Account type</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Wallet className="w-4 h-4 mr-2" />
                    Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.balance.toLocaleString()}</div>
                  <p className="text-xs text-slate-400">Current balance</p>
                </CardContent>
              </Card>
            </div>

            {/* Generate Key */}
            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Generate Key
                </CardTitle>
                <CardDescription>Generate API keys for supported games</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Custom Key Toggle */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
                  <input
                    type="checkbox"
                    id="useCustomKey"
                    checked={generateKeyForm.useCustomKey}
                    onChange={(e) =>
                      setGenerateKeyForm({ ...generateKeyForm, useCustomKey: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                  />
                  <label htmlFor="useCustomKey" className="text-sm font-medium text-slate-300">
                    Use Custom Key
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Game</label>
                    <Select
                      value={generateKeyForm.game}
                      onValueChange={(value) =>
                        setGenerateKeyForm({ ...generateKeyForm, game: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select game" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {['CODM', 'MLBB', 'HOK', 'FF', 'PUBG', 'VAL', 'GI', 'AOV'].map((game) => (
                          <SelectItem key={game} value={game}>{game}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Duration</label>
                    <Select
                      value={generateKeyForm.keyType}
                      onValueChange={(value) =>
                        setGenerateKeyForm({ ...generateKeyForm, keyType: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="1day">1 Day</SelectItem>
                        <SelectItem value="7days">7 Days</SelectItem>
                        <SelectItem value="30days">30 Days</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {generateKeyForm.useCustomKey ? (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-300 block mb-2">Custom Key</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter your custom key..."
                          value={generateKeyForm.customKey}
                          onChange={(e) =>
                            setGenerateKeyForm({ ...generateKeyForm, customKey: e.target.value })
                          }
                          className="bg-slate-700 border-slate-600 flex-1"
                        />
                        <Button
                          onClick={handleGenerateKey}
                          disabled={generateKeyLoading}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {generateKeyLoading ? 'Creating...' : 'Create'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-300 block mb-2">Quantity</label>
                        <Select
                          value={generateKeyForm.quantity.toString()}
                          onValueChange={(value) =>
                            setGenerateKeyForm({ ...generateKeyForm, quantity: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Select quantity" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {[1, 2, 3, 5, 10].map((qty) => (
                              <SelectItem key={qty} value={qty.toString()}>{qty}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleGenerateKey}
                          disabled={generateKeyLoading}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {generateKeyLoading ? 'Generating...' : 'Generate'}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Generated Keys Display */}
                {generatedKeys.length > 0 && (
                  <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-200">Generated Keys</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedKeys.join('\n'))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {generatedKeys.map((key, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-800 p-2 rounded"
                        >
                          <code className="text-sm font-mono text-emerald-400">{key}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(key)}
                            className="h-7 w-7 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


          </TabsContent>

          {/* Users Tab */}
          {['owner', 'admin'].includes(user?.role || '') && (
            <TabsContent value="users">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">User management features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Invitations Tab */}
          {['owner', 'admin'].includes(user?.role || '') && (
            <TabsContent value="invitations">
              <div className="space-y-6">
                {/* Create Invitation Card */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Invitation Code
                    </CardTitle>
                    <CardDescription>
                      {user?.role === 'owner'
                        ? 'Create invitation codes for owner, admin, or reseller roles'
                        : 'Create invitation codes for reseller role'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-slate-300 block mb-2">Role</label>
                        <Select
                          value={createInviteForm.role}
                          onValueChange={(value: 'owner' | 'admin' | 'reseller') =>
                            setCreateInviteForm({ ...createInviteForm, role: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {user?.role === 'owner' && (
                              <>
                                <SelectItem value="owner" className="text-blue-400">Owner</SelectItem>
                                <SelectItem value="admin" className="text-green-400">Admin</SelectItem>
                              </>
                            )}
                            <SelectItem value="reseller" className="text-orange-400">Reseller</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium text-slate-300 block mb-2">Expires In (Days)</label>
                        <Select
                          value={createInviteForm.expires_in_days.toString()}
                          onValueChange={(value) =>
                            setCreateInviteForm({ ...createInviteForm, expires_in_days: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Select expiry" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="3">3 Days</SelectItem>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="14">14 Days</SelectItem>
                            <SelectItem value="30">30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={createInvitation}
                          disabled={invitationLoading}
                          className="w-full sm:w-auto"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {invitationLoading ? 'Creating...' : 'Create Code'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Invitations List */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gift className="w-5 h-5 mr-2" />
                      Invitation Codes
                    </CardTitle>
                    <CardDescription>
                      Manage your invitation codes ({invitations.length} total)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invitations.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No invitation codes yet</p>
                        <p className="text-sm">Create your first invitation code above</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invitations.map((invite) => {
                          const isExpired = new Date(invite.expires_at) < new Date();
                          const isUsed = invite.is_used;
                          const isActive = !isExpired && !isUsed;

                          return (
                            <div
                              key={invite.id}
                              className={`bg-slate-700 rounded-lg p-4 border ${
                                isActive ? 'border-slate-600' : 'border-slate-700 opacity-60'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <code className="text-lg font-mono text-white bg-slate-800 px-3 py-1 rounded">
                                      {invite.code}
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(invite.code)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <Badge
                                      variant="outline"
                                      className={
                                        invite.role === 'owner'
                                          ? 'border-blue-500 text-blue-400'
                                          : invite.role === 'admin'
                                          ? 'border-green-500 text-green-400'
                                          : 'border-orange-500 text-orange-400'
                                      }
                                    >
                                      {invite.role}
                                    </Badge>
                                    {isUsed ? (
                                      <Badge variant="secondary" className="bg-slate-600">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Used
                                      </Badge>
                                    ) : isExpired ? (
                                      <Badge variant="destructive">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Expired
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-emerald-600">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Active
                                      </Badge>
                                    )}
                                    <span className="text-slate-400">
                                      Expires: {new Date(invite.expires_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {isActive && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Revoke
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                                      <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to revoke this invitation code? This action cannot be undone.
                                      </AlertDialogDescription>
                                      <div className="flex justify-end gap-2 mt-4">
                                        <AlertDialogCancel className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => revokeInvitation(invite.code)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Revoke
                                        </AlertDialogAction>
                                      </div>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Keys Tab */}
          <TabsContent value="keys">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  My API Keys
                </CardTitle>
                <CardDescription>
                  Manage your generated API keys ({apiKeys.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No API keys found</p>
                    <p className="text-sm">Generate one from the Home tab to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((key) => {
                      const isExpired = key.days_remaining !== undefined && key.days_remaining !== null && key.days_remaining <= 0;
                      const isLifetime = key.days_remaining === null || key.days_remaining === -1;
                      
                      return (
                        <div key={key.id} className={`bg-slate-700 rounded-lg p-4 border ${isExpired ? 'border-red-600 opacity-60' : 'border-slate-600'}`}>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <code className="text-lg font-mono text-emerald-400 bg-slate-800 px-3 py-1 rounded">
                                  {key.api_key}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(key.api_key)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="outline" className="border-blue-500 text-blue-400">
                                  {key.key_type}
                                </Badge>
                                {isExpired ? (
                                  <Badge variant="destructive">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Expired
                                  </Badge>
                                ) : isLifetime ? (
                                  <Badge className="bg-purple-600">
                                    Lifetime
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {key.days_remaining} days left
                                  </Badge>
                                )}
                                {key.serial_number ? (
                                  <Badge variant="secondary" className="bg-slate-600">
                                    Device Bound
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-slate-500 text-slate-400">
                                    Not Bound
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Change Duration */}
                              <Select onValueChange={(value) => handleUpdateKeyDuration(key.id, value)}>
                                <SelectTrigger className="w-[130px] bg-slate-600 border-slate-500">
                                  <SelectValue placeholder="Duration" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-700 border-slate-600">
                                  <SelectItem value="1day">1 Day</SelectItem>
                                  <SelectItem value="7days">7 Days</SelectItem>
                                  <SelectItem value="30days">30 Days</SelectItem>
                                  <SelectItem value="lifetime">Lifetime</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Reset Device */}
                              {key.serial_number && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/20">
                                      Reset Device
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-800 border-slate-700">
                                    <AlertDialogTitle>Reset Device Binding</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will unbind the key from the current device. The key can then be used on a new device.
                                    </AlertDialogDescription>
                                    <div className="flex justify-end gap-2 mt-4">
                                      <AlertDialogCancel className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleResetDevice(key.id)}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Reset
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* Delete Key */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-800 border-slate-700">
                                  <AlertDialogTitle>Delete Key</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this key? This action cannot be undone.
                                  </AlertDialogDescription>
                                  <div className="flex justify-end gap-2 mt-4">
                                    <AlertDialogCancel className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteKey(key.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={passwordLoading} className="w-full">
                    {passwordLoading ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
