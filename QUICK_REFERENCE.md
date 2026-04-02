# Quick Reference Card - Key Generator Server

## 🚀 5-Minute Setup

```bash
# 1. Install
pnpm install

# 2. Configure
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# 3. Initialize database
node scripts/init-db.js

# 4. Start
pnpm dev

# 5. Open browser
# http://localhost:3000
```

## 📡 API Quick Links

All endpoints are under `/api` prefix.

### Authentication
```
POST /auth/login
POST /auth/register
```

### Main Key Endpoint
```
POST /connect
  action: validate | generate | check | revoke
```

### Admin Endpoints
```
GET  /admin/users
POST /admin/balance
POST /admin/role
POST /admin/invitations
```

## 🎮 8 Game Types

```
CODM  | MLBB  | HOK   | FF
PUBG  | VAL   | GI    | AOV
```

## 🔐 3 User Roles

| Role | Balance | Manage Users | Create Invites |
|------|---------|--------------|----------------|
| Owner | ∞ | ✓ All | ✓ All |
| Admin | ∞ | ✓ (not Owner) | ✓ Reseller |
| Reseller | 9,999,999,999,999,999 | ✗ | ✗ |

## 💰 Balance Operations

```
set     - Set to exact amount (Owner)
add     - Add amount (Owner/Admin)
deduct  - Subtract amount (Owner/Admin)
transfer- Between users (Owner/Admin)
```

## 🔑 Key Operations

```
validate  - Check if key is valid
generate  - Create new key
check     - Get key details
revoke    - Disable key
```

## 🧪 Common cURL Commands

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"pass"}'
```

### Validate Key
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action":"validate",
    "api_key":"...",
    "serial_number":"...",
    "key_type":"CODM"
  }'
```

### Add Balance
```bash
curl -X POST http://localhost:3000/api/admin/balance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"add",
    "target_user_id":"uuid",
    "amount":1000000
  }'
```

### Create Invitation
```bash
curl -X POST http://localhost:3000/api/admin/invitations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"create","role":"reseller"}'
```

## 📊 Database Quick Schema

```
users           api_keys         invitations      transactions
├── id          ├── id            ├── id           ├── id
├── username    ├── user_id       ├── code         ├── from_user
├── password    ├── key_type      ├── role         ├── to_user
├── role        ├── api_key       ├── is_used      ├── amount
└── balance     └── serial_number └── created_at   └── type
```

## 🔐 Security Checklist

- [ ] Use HTTPS in production
- [ ] Change default passwords
- [ ] Enable 2FA in Supabase
- [ ] Set strong JWT secret
- [ ] Configure CORS
- [ ] Enable database backups
- [ ] Monitor transaction logs
- [ ] Set up error logging

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/app/api/connect/route.ts` | Key validation |
| `/app/api/auth/login/route.ts` | Login |
| `/app/api/admin/balance/route.ts` | Balance ops |
| `/lib/auth.ts` | Auth utilities |
| `/lib/api-client.ts` | SDK for integration |

## 📚 Documentation Map

```
├── README.md              ← Start here
├── SETUP.md               ← Installation
├── API_DOCUMENTATION.md   ← Full API details
├── TESTING.md             ← Test examples
├── PROJECT_SUMMARY.md     ← Complete overview
├── QUICK_REFERENCE.md     ← This file
└── INDEX.md               ← Navigation guide
```

## ⚡ Common Tasks

### Create Reseller
```
1. Create invitation → /admin/invitations
2. Share code
3. Register → /auth/register
4. Add balance → /admin/balance
```

### Generate Key
```
POST /api/connect
{
  "action": "generate",
  "user_id": "uuid",
  "key_type": "CODM",
  "days_valid": 30
}
```

### Validate Key
```
POST /api/connect
{
  "action": "validate",
  "api_key": "...",
  "serial_number": "...",
  "key_type": "CODM"
}
```

### Revoke Key
```
POST /api/connect
{
  "action": "revoke",
  "api_key": "..."
}
```

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| DB connection failed | Check .env.local |
| Auth failed | Check password hash |
| Key invalid | Check serial number |
| Permission denied | Check user role |
| Balance limit | Reseller max: 9,999,999,999,999,999 |

## 🌐 Deployment Commands

```bash
# Vercel
vercel

# Docker
docker build -t key-gen .
docker run -p 3000:3000 key-gen

# Next.js production
npm run build
npm start
```

## 🧩 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
POSTGRES_URL
DATABASE_URL
```

See `.env.example` for complete list.

## 📊 Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "error": "Error message"
}
```

### Key Response
```json
{
  "valid": true,
  "status": "VALID",
  "days_remaining": 25,
  "expires_at": "2024-02-15T12:00:00Z"
}
```

## 🎯 HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict
- `500` - Server error

## 💡 Tips

1. **Save tokens** from login response
2. **Use Bearer token** in Authorization header
3. **Check serial number** format: `GAME-TIMESTAMP-RANDOM`
4. **Test with cURL** before integrating
5. **Monitor transactions** for audit trail
6. **Set expiration dates** for invitations
7. **Max reseller balance** is 9,999,999,999,999,999
8. **Token expires** after 30 days

## 🚀 Next Steps

1. Read [README.md](./README.md)
2. Follow [SETUP.md](./SETUP.md)
3. Test with [TESTING.md](./TESTING.md)
4. Integrate using [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
5. Deploy using [SETUP.md](./SETUP.md)

---

For detailed info, see [INDEX.md](./INDEX.md)
