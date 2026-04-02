## Quick Start (5 Minutes)

### 1. Initialize Owner & Get Invitation Code

```bash
node scripts/create-owner.js
```

This will:
- Create Owner account (username: `owner`, password: `owner123`)
- Generate invitation code for you
- Show everything you need

### 2. Register as Reseller

1. Open http://localhost:3000
2. Click "Register" tab
3. Fill in username, password, and paste your invitation code
4. Click "Register"
5. Done! You're logged in as Reseller

### 3. Start Using

**Home Tab:**
- See your balance (starts at 0)
- Generate API keys for games (CODM, MLBB, HOK, FF, PUBG, VAL, GI, AOV)
- View your transactions

**If You're Owner:**
- Users Tab: See all users, manage balances
- Invitations Tab: Create new invitations for others
- See role-based options

---

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Owner | owner | owner123 |
| You | (register) | (your choice) |

---

## Key Features

✅ 8 Game Types (CODM, MLBB, HOK, FF, PUBG, VAL, GI, AOV)
✅ API Key Generation & Validation
✅ 3 User Roles (Owner, Admin, Reseller)
✅ Balance Management
✅ Invitation System
✅ Transaction History
✅ Full Admin Dashboard

---

## Files to Read

1. **LOGIN_GUIDE.md** ← Read this for detailed login instructions
2. **API_DOCUMENTATION.md** ← For API integration
3. **TESTING.md** ← For testing examples
4. **README.md** ← For full overview

---

## Common Commands

```bash
# Start development server
pnpm dev

# Create owner account
node scripts/create-owner.js

# Initialize database
node scripts/init-db.js

# Production build
pnpm build
pnpm start
```

---

## Support

For questions, check:
- LOGIN_GUIDE.md - Login & account creation
- API_DOCUMENTATION.md - API endpoints
- TESTING.md - Testing examples
- SETUP.md - Installation details
