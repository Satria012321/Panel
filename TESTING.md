# Testing Guide - Key Generator Server

This guide provides examples for testing all API endpoints.

## Setup for Testing

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Get Your Token
Login first to get a JWT token:
```bash
# Store this token for other requests
OWNER_TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

## Authentication Tests

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "owner",
    "password": "your_password"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "owner",
    "role": "owner",
    "balance": 999999999999999999
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Test Register (with valid invitation)
First create an invitation, then use it:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newreseller",
    "password": "securepass123",
    "invitation_code": "ABC123DEF456GHIJKL"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "new-uuid",
    "username": "newreseller",
    "role": "reseller",
    "balance": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Key Management Tests (/connect Endpoint)

### Test 1: Validate Invalid Key
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "api_key": "nonexistent",
    "serial_number": "INVALID-000-000",
    "key_type": "CODM"
  }'
```

**Expected Response:**
```json
{
  "valid": false,
  "status": "INVALID",
  "message": "Invalid API key, serial number, or key type combination"
}
```

### Test 2: Generate API Key
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate",
    "user_id": "owner-uuid",
    "key_type": "CODM",
    "days_valid": 30
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "key_id": "key-uuid",
  "api_key": "a1b2c3d4e5f6...",
  "serial_number": "CODM-1704067200000-ABC123",
  "key_type": "CODM",
  "days_valid": 30,
  "expires_at": "2024-02-20T12:34:56Z"
}
```

### Test 3: Validate Generated Key
Use the key and serial_number from Test 2:
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "api_key": "a1b2c3d4e5f6...",
    "serial_number": "CODM-1704067200000-ABC123",
    "key_type": "CODM"
  }'
```

**Expected Response:**
```json
{
  "valid": true,
  "status": "VALID",
  "game_type": "CODM",
  "days_remaining": 29,
  "expires_at": "2024-02-20T12:34:56Z",
  "created_at": "2024-01-21T12:34:56Z"
}
```

### Test 4: Check Key Status
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action": "check",
    "api_key": "a1b2c3d4e5f6..."
  }'
```

**Expected Response:**
```json
{
  "api_key": "a1b2c3d4e5f6...",
  "key_type": "CODM",
  "serial_number": "CODM-1704067200000-ABC123",
  "is_active": true,
  "days_remaining": 29,
  "created_at": "2024-01-21T12:34:56Z",
  "expires_at": "2024-02-20T12:34:56Z",
  "revoked_at": null
}
```

### Test 5: Revoke Key
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action": "revoke",
    "api_key": "a1b2c3d4e5f6..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API key revoked"
}
```

### Test 6: Validate After Revoke
Run Test 3 again with same key:
**Expected Response:**
```json
{
  "valid": false,
  "status": "INVALID",
  "message": "Invalid API key, serial number, or key type combination"
}
```

## User Management Tests

### Get All Users
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "owner-uuid",
      "username": "owner",
      "role": "owner",
      "balance": 999999999999999999,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "reseller-uuid",
      "username": "reseller1",
      "role": "reseller",
      "balance": 5000000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Balance Management Tests

### Test 1: Set Balance (Owner Only)
```bash
curl -X POST http://localhost:3000/api/admin/balance \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "target_user_id": "reseller-uuid",
    "amount": 10000000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Balance updated",
  "new_balance": 10000000
}
```

### Test 2: Add Balance
```bash
curl -X POST http://localhost:3000/api/admin/balance \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "target_user_id": "reseller-uuid",
    "amount": 5000000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Balance added",
  "new_balance": 15000000
}
```

### Test 3: Deduct Balance
```bash
curl -X POST http://localhost:3000/api/admin/balance \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deduct",
    "target_user_id": "reseller-uuid",
    "amount": 2000000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Balance deducted",
  "new_balance": 13000000
}
```

### Test 4: Transfer Balance
```bash
curl -X POST http://localhost:3000/api/admin/balance \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "transfer",
    "target_user_id": "reseller1-uuid",
    "to_user_id": "reseller2-uuid",
    "amount": 1000000
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Balance transferred",
  "from_balance": 12000000,
  "to_balance": 6000000
}
```

### Test 5: Exceed Reseller Max Balance
```bash
curl -X POST http://localhost:3000/api/admin/balance \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "target_user_id": "reseller-uuid",
    "amount": 9999999999999999999
  }'
```

**Expected Response:**
```json
{
  "error": "Reseller balance cannot exceed 9999999999999999"
}
```

## Role Management Tests

### Change User Role (Owner Only)
```bash
curl -X POST http://localhost:3000/api/admin/role \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": "reseller-uuid",
    "new_role": "admin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Role changed to admin",
  "old_role": "reseller",
  "new_role": "admin"
}
```

### Try to Change Owner Role
```bash
curl -X POST http://localhost:3000/api/admin/role \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_user_id": "owner-uuid",
    "new_role": "admin"
  }'
```

**Expected Response:**
```json
{
  "error": "Cannot change owner role"
}
```

## Invitation Tests

### Test 1: Create Invitation (Owner)
```bash
curl -X POST http://localhost:3000/api/admin/invitations \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "role": "reseller",
    "expires_in_days": 7
  }'
```

**Expected Response:**
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

### Test 2: List Invitations
```bash
curl -X POST http://localhost:3000/api/admin/invitations \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list"
  }'
```

**Expected Response:**
```json
{
  "invitations": [
    {
      "id": "invitation-uuid",
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

### Test 3: Revoke Invitation
```bash
curl -X POST http://localhost:3000/api/admin/invitations \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "revoke",
    "invitation_code": "ABC123DEF456GHIJKL"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Invitation revoked"
}
```

## Error Testing

### Test Unauthorized Access
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response:**
```json
{
  "error": "Invalid token"
}
```

### Test Missing Authorization
```bash
curl -X GET http://localhost:3000/api/admin/users
```

**Expected Response:**
```json
{
  "error": "Unauthorized"
}
```

### Test Permission Denied
As a reseller, try to access admin endpoints:
```bash
curl -X POST http://localhost:3000/api/admin/invitations \
  -H "Authorization: Bearer $RESELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list"
  }'
```

**Expected Response:**
```json
{
  "error": "Resellers cannot create invitations"
}
```

## Automated Testing with Postman

### Import Collection
1. Copy the Postman collection from the project
2. Import into Postman
3. Set environment variables:
   - `base_url`: http://localhost:3000/api
   - `owner_token`: Your owner JWT token
   - `reseller_token`: Your reseller JWT token

### Run Tests
1. Open Collections in Postman
2. Click "Run"
3. Select the collection
4. Click "Start Test Run"

## Load Testing

### Using Apache Bench
```bash
# Test /connect validation endpoint
ab -n 1000 -c 10 -p connect-data.json \
  -T application/json \
  http://localhost:3000/api/connect
```

### Using wrk
```bash
wrk -t4 -c100 -d30s \
  --script=post.lua \
  http://localhost:3000/api/connect
```

## Monitoring

### Check Database Transactions
```sql
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check API Keys
```sql
SELECT api_key, key_type, is_active, expires_at 
FROM api_keys 
WHERE user_id = 'your-user-uuid';
```

### Check User Balances
```sql
SELECT username, role, balance 
FROM users 
ORDER BY created_at DESC;
```

## Test Coverage Checklist

- [ ] Authentication (Login, Register)
- [ ] Key Generation for all 8 games
- [ ] Key Validation (Valid, Invalid, Expired)
- [ ] Key Status Check
- [ ] Key Revocation
- [ ] User Management (List, Create)
- [ ] Balance Management (Set, Add, Deduct, Transfer)
- [ ] Role Changes
- [ ] Invitations (Create, List, Revoke)
- [ ] Permissions (Owner, Admin, Reseller)
- [ ] Error Handling
- [ ] Rate Limiting
- [ ] JWT Expiration

## Tips for Testing

1. **Always save tokens** from login responses
2. **Use environment variables** for tokens in cURL
3. **Check timestamps** to verify records were created
4. **Monitor database** for transaction records
5. **Test edge cases** like max balance for resellers
6. **Test permissions** for different roles
7. **Verify expired keys** are rejected
8. **Check transaction audit trail** for all operations
