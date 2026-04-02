# Key Generator Server - API Documentation

## Overview
This is a comprehensive key generator server for managing game keys with role-based access control. The backend is accessible via the `/connect` endpoint and supporting routes.

## Base URL
```
https://yourdomain.com/api
```

## Authentication

### Login
Create a session and get JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "user123",
    "role": "reseller",
    "balance": 1000000,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Register
Create new account using invitation code.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "invitation_code": "ABC123DEF456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "newuser",
    "role": "reseller",
    "balance": 0,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Key Management

### Validate API Key (Main /connect Endpoint)
Verify if an API key is valid and check remaining days.

**Endpoint:** `POST /connect`

**Request Body:**
```json
{
  "action": "validate",
  "api_key": "key_hex_string",
  "serial_number": "CODM-1704067200000-ABC123",
  "key_type": "CODM"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "status": "VALID",
  "game_type": "CODM",
  "days_remaining": 25,
  "expires_at": "2024-02-15T12:34:56Z",
  "created_at": "2024-01-21T12:34:56Z"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid API key, serial number, or key type combination",
  "status": "INVALID"
}
```

**Supported Games:**
- `CODM` - Call of Duty Mobile
- `MLBB` - Mobile Legends Bang Bang
- `HOK` - Honor of Kings
- `FF` - Free Fire
- `PUBG` - PUBG Mobile
- `VAL` - Valorant
- `GI` - Genshin Impact
- `AOV` - Arena of Valor

### Generate API Key
Create a new API key for a user (Admin/Owner only).

**Endpoint:** `POST /connect`

**Request Body:**
```json
{
  "action": "generate",
  "user_id": "uuid",
  "key_type": "CODM",
  "days_valid": 30
}
```

**Response:**
```json
{
  "success": true,
  "key_id": "uuid",
  "api_key": "a1b2c3d4e5f6...",
  "serial_number": "CODM-1704067200000-ABC123",
  "key_type": "CODM",
  "days_valid": 30,
  "expires_at": "2024-02-20T12:34:56Z"
}
```

### Check Key Status
Get detailed information about a specific key.

**Endpoint:** `POST /connect`

**Request Body:**
```json
{
  "action": "check",
  "api_key": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "api_key": "a1b2c3d4e5f6...",
  "key_type": "CODM",
  "serial_number": "CODM-1704067200000-ABC123",
  "is_active": true,
  "days_remaining": 25,
  "created_at": "2024-01-21T12:34:56Z",
  "expires_at": "2024-02-20T12:34:56Z",
  "revoked_at": null
}
```

### Revoke API Key
Disable an API key.

**Endpoint:** `POST /connect`

**Request Body:**
```json
{
  "action": "revoke",
  "api_key": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key revoked"
}
```

## Balance Management

### Get All Users
List all users with their details (Owner/Admin only).

**Endpoint:** `GET /admin/users`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "user123",
      "role": "reseller",
      "balance": 5000000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Set Balance
Set user balance to exact amount (Owner only).

**Endpoint:** `POST /admin/balance`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "set",
  "target_user_id": "uuid",
  "amount": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Balance updated",
  "new_balance": 1000000
}
```

### Add Balance
Add amount to user balance (Owner/Admin).

**Endpoint:** `POST /admin/balance`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "add",
  "target_user_id": "uuid",
  "amount": 500000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Balance added",
  "new_balance": 1500000
}
```

### Deduct Balance
Deduct amount from user balance (Owner/Admin).

**Endpoint:** `POST /admin/balance`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "deduct",
  "target_user_id": "uuid",
  "amount": 100000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Balance deducted",
  "new_balance": 1400000
}
```

### Transfer Balance
Transfer balance between users (Owner/Admin).

**Endpoint:** `POST /admin/balance`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "transfer",
  "target_user_id": "from_user_uuid",
  "to_user_id": "to_user_uuid",
  "amount": 100000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Balance transferred",
  "from_balance": 900000,
  "to_balance": 600000
}
```

## Role Management

### Change User Role
Change user role (Owner only).

**Endpoint:** `POST /admin/role`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "target_user_id": "uuid",
  "new_role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role changed to admin",
  "old_role": "reseller",
  "new_role": "admin"
}
```

**Available Roles:**
- `owner` - Unlimited balance, manage all users, create any invitations
- `admin` - Unlimited balance, manage users (except owner), create reseller invitations
- `reseller` - Limited balance (max 9999999999999999), buy balance from owner/admin

## Invitation System

### Create Invitation
Generate invitation code for new account.

**Endpoint:** `POST /admin/invitations`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "create",
  "role": "reseller",
  "expires_in_days": 7
}
```

**Response:**
```json
{
  "success": true,
  "invitation": {
    "code": "ABC123DEF456GHIJKL",
    "role": "reseller",
    "created_at": "2024-01-21T12:34:56Z",
    "expires_at": "2024-01-28T12:34:56Z"
  }
}
```

### List Invitations
Get all invitations (Owner/Admin).

**Endpoint:** `POST /admin/invitations`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "list"
}
```

**Response:**
```json
{
  "invitations": [
    {
      "id": "uuid",
      "code": "ABC123DEF456GHIJKL",
      "role": "reseller",
      "is_used": false,
      "used_by": null,
      "created_at": "2024-01-21T12:34:56Z",
      "expires_at": "2024-01-28T12:34:56Z"
    }
  ]
}
```

### Revoke Invitation
Expire an invitation code.

**Endpoint:** `POST /admin/invitations`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "revoke",
  "invitation_code": "ABC123DEF456GHIJKL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invitation revoked"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Username and password required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Owner or Admin required"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting & Security

- All passwords are hashed using SHA256
- API keys are 32-byte random hexadecimal strings
- JWT tokens expire after 30 days
- Serial numbers include game type, timestamp, and random component
- Row Level Security (RLS) enforced on database

## Integration Example

### Node.js/JavaScript
```javascript
const API_BASE = 'https://yourdomain.com/api';

// Login
const loginRes = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user123', password: 'pass123' })
});
const { token } = await loginRes.json();

// Validate key
const validateRes = await fetch(`${API_BASE}/connect`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'validate',
    api_key: 'key_hex',
    serial_number: 'CODM-...',
    key_type: 'CODM'
  })
});
const result = await validateRes.json();
console.log(result.valid); // true or false
```

## Testing the API

You can test the API endpoints using cURL:

```bash
# Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"user123","password":"pass123"}'

# Validate key
curl -X POST https://yourdomain.com/api/connect \
  -H 'Content-Type: application/json' \
  -d '{
    "action":"validate",
    "api_key":"abc123...",
    "serial_number":"CODM-...",
    "key_type":"CODM"
  }'
```
