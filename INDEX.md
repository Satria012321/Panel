# Key Generator Server - Complete Index

Welcome! This document will help you navigate and understand the Key Generator Server project.

## 📖 Documentation (Read These First)

### For Getting Started
1. **[README.md](./README.md)** ⭐ START HERE
   - Project overview
   - Features at a glance
   - Quick start instructions
   - Technology stack

2. **[SETUP.md](./SETUP.md)** - Installation & Configuration
   - Step-by-step installation
   - Environment setup
   - Database initialization
   - First-time workflow
   - Troubleshooting

3. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API Reference
   - All endpoint details
   - Request/response examples
   - Error codes
   - Authentication
   - Rate limiting

4. **[TESTING.md](./TESTING.md)** - Testing & Examples
   - cURL examples for every endpoint
   - Test scenarios
   - Postman collection info
   - Load testing
   - Monitoring

5. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project Overview
   - Complete feature list
   - Database schema
   - Security features
   - Workflow examples
   - Deployment options

6. **[.env.example](./.env.example)** - Environment Template
   - All required environment variables
   - Configuration guide
   - Where to find each value

## 🗂️ Project Structure

```
key-generator-server/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts               # Login endpoint
│   │   │   └── register/route.ts            # Registration endpoint
│   │   ├── admin/
│   │   │   ├── users/route.ts               # User management
│   │   │   ├── balance/route.ts             # Balance operations
│   │   │   ├── role/route.ts                # Role management
│   │   │   └── invitations/route.ts         # Invitation system
│   │   └── connect/route.ts                 # Main key validation endpoint
│   ├── page.tsx                             # Dashboard UI
│   ├── layout.tsx                           # Root layout
│   └── globals.css                          # Global styles
│
├── lib/
│   ├── auth.ts                              # Authentication utilities & DB functions
│   ├── api-client.ts                        # JavaScript SDK for integration
│   └── utils.ts                             # Helper functions
│
├── scripts/
│   ├── 01-init-schema.sql                   # Database migration (SQL)
│   └── init-db.js                           # Database initialization (Node.js)
│
├── components/                              # React components
│   └── ui/                                  # Pre-installed shadcn components
│
├── hooks/                                   # React hooks
│   ├── use-toast.ts
│   └── use-mobile.ts
│
├── public/                                  # Static assets
│
├── Documentation Files
│   ├── README.md                            # Project overview
│   ├── SETUP.md                             # Installation guide
│   ├── API_DOCUMENTATION.md                 # API reference
│   ├── TESTING.md                           # Testing guide
│   ├── PROJECT_SUMMARY.md                   # Complete summary
│   └── INDEX.md                             # This file
│
├── Configuration Files
│   ├── .env.example                         # Environment template
│   ├── package.json                         # Dependencies
│   ├── tsconfig.json                        # TypeScript config
│   ├── tailwind.config.ts                   # Tailwind config
│   ├── postcss.config.mjs                   # PostCSS config
│   ├── next.config.mjs                      # Next.js config
│   └── components.json                      # shadcn config
│
└── Database Files
    └── scripts/01-init-schema.sql           # PostgreSQL schema
```

## 🚀 Getting Started Path

### Step 1: Read Documentation
1. Read [README.md](./README.md) for overview
2. Review [SETUP.md](./SETUP.md) for installation

### Step 2: Install & Configure
```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local
```

### Step 3: Initialize Database
```bash
# Run database initialization
node scripts/init-db.js

# Or execute SQL directly in Supabase dashboard
# Copy contents of scripts/01-init-schema.sql
```

### Step 4: Start Development
```bash
# Run dev server
pnpm dev

# Open browser to http://localhost:3000
```

### Step 5: Test the APIs
- Read [TESTING.md](./TESTING.md)
- Use provided cURL examples
- Import Postman collection

## 📡 API Endpoints Quick Reference

### Authentication
```
POST /api/auth/login              - User login
POST /api/auth/register           - New user registration
```

### Key Management (Main endpoint)
```
POST /api/connect                 - Validate/generate/revoke/check keys
```

### User Management (Admin only)
```
GET  /admin/users                 - List all users
POST /admin/balance               - Manage balances
POST /admin/role                  - Change user roles
POST /admin/invitations           - Manage invitations
```

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.**

## 🎮 Supported Games

| Code | Game |
|------|------|
| CODM | Call of Duty Mobile |
| MLBB | Mobile Legends Bang Bang |
| HOK | Honor of Kings |
| FF | Free Fire |
| PUBG | PUBG Mobile |
| VAL | Valorant |
| GI | Genshin Impact |
| AOV | Arena of Valor |

## 🔐 User Roles

### Owner
- ✓ Unlimited balance
- ✓ Full user management
- ✓ Change any role
- ✓ Create any invitations
- ✓ View all transactions

### Admin
- ✓ Unlimited balance
- ✓ Manage users (not Owner)
- ✗ Cannot change roles
- ✓ Create reseller invitations
- ✓ View all transactions

### Reseller
- ✓ Limited balance (max: 9,999,999,999,999,999)
- ✗ Cannot manage users
- ✓ View own transactions
- ✓ Buy balance from Owner/Admin

**See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for complete details.**

## 💾 Key Database Tables

### users
Primary table for user accounts
- id, username, password_hash, role, balance
- See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

### api_keys
API keys for each game
- id, user_id, key_type, api_key, serial_number, expires_at
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### invitations
Invitation codes for account creation
- id, code, role, is_used, created_by
- See [SETUP.md](./SETUP.md)

### transactions
Audit trail for all operations
- id, from_user_id, to_user_id, amount, transaction_type
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for complete schema.**

## 🔒 Security Features

✓ SHA256 password hashing
✓ JWT token authentication (30-day expiration)
✓ Row Level Security on database
✓ Role-based permissions
✓ Transaction audit trail
✓ Input validation
✓ Serial number validation

**See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for more.**

## 🛠️ Technology Stack

- **Next.js** 16 (React framework)
- **React** 19 (UI library)
- **TypeScript** (Type safety)
- **Supabase** (PostgreSQL + Auth)
- **shadcn/ui** (Component library)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)

**See [README.md](./README.md) for details.**

## 📊 File-by-File Guide

### Core API Files

#### `/app/api/connect/route.ts`
Main endpoint for key validation/generation
- validate action
- generate action
- check action
- revoke action
- **See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

#### `/app/api/auth/login/route.ts`
User authentication
- Takes username & password
- Returns JWT token
- **See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

#### `/app/api/auth/register/route.ts`
User registration
- Requires invitation code
- Creates new user
- **See [SETUP.md](./SETUP.md)**

#### `/app/api/admin/balance/route.ts`
Balance management
- set, add, deduct, transfer actions
- Role-based restrictions
- **See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

#### `/app/api/admin/users/route.ts`
User management
- List all users
- Owner/Admin only
- **See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

#### `/app/api/admin/role/route.ts`
Role management
- Change user roles
- Owner only
- **See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

#### `/app/api/admin/invitations/route.ts`
Invitation system
- create, list, revoke actions
- Expiration management
- **See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

### Utility Files

#### `/lib/auth.ts`
Core authentication functions
- Password hashing
- Token generation/verification
- User CRUD operations
- Database connection setup

#### `/lib/api-client.ts`
JavaScript SDK for integration
- Pre-built methods for all endpoints
- Automatic token management
- Error handling
- **See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

#### `/lib/utils.ts`
Helper functions
- Class name utilities (cn)
- Other utility functions

### UI Files

#### `/app/page.tsx`
Main dashboard
- Login/Register interface
- User dashboard
- Key management
- Balance display

#### `/app/layout.tsx`
Root layout
- Global setup
- Theme configuration
- Fonts and metadata

## 📝 Example Workflows

### Workflow 1: Create Reseller Account
1. Owner creates invitation → `/admin/invitations` (create)
2. Reseller registers → `/auth/register`
3. Owner adds balance → `/admin/balance` (add)
4. Done! Reseller can generate keys

**See [TESTING.md](./TESTING.md) for cURL examples**

### Workflow 2: Generate and Validate Key
1. Reseller generates key → `/api/connect` (generate)
2. Client validates key → `/api/connect` (validate)
3. If valid, key is active
4. If expired/revoked, key is invalid

**See [TESTING.md](./TESTING.md) for cURL examples**

### Workflow 3: Transfer Balance
1. Owner logs in → `/auth/login`
2. Owner transfers balance → `/admin/balance` (transfer)
3. Transaction recorded in database
4. Both users' balances updated

**See [TESTING.md](./TESTING.md) for cURL examples**

## 🧪 Testing Resources

### Quick Test
```bash
# Start dev server
pnpm dev

# In another terminal, test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"your_password"}'
```

### Complete Testing
- Read [TESTING.md](./TESTING.md)
- Follow provided examples
- Use Postman collection (if available)
- Run load tests as needed

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```bash
docker build -t key-generator .
docker run -p 3000:3000 key-generator
```

### Other Platforms
- AWS, Google Cloud, DigitalOcean, Heroku, etc.

**See [SETUP.md](./SETUP.md) for details**

## ❓ Troubleshooting

### Problem: "Database connection failed"
**Solution:** Check [SETUP.md](./SETUP.md) environment setup section

### Problem: "Authentication failed"
**Solution:** Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) auth section

### Problem: "API key validation returns INVALID"
**Solution:** Check [TESTING.md](./TESTING.md) key validation section

### Problem: "Balance update failed"
**Solution:** Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) balance section

**See [SETUP.md](./SETUP.md) troubleshooting section for more**

## 📞 Quick Help

| Question | Answer |
|----------|--------|
| How do I install? | See [SETUP.md](./SETUP.md) |
| How do I use the API? | See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) |
| How do I test? | See [TESTING.md](./TESTING.md) |
| What features? | See [README.md](./README.md) |
| How do I deploy? | See [SETUP.md](./SETUP.md) deployment section |
| Database schema? | See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |
| Security? | See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |
| Roles & permissions? | See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) |

## 🔗 External Resources

- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Supabase Documentation](https://supabase.com/docs)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)**

## 📋 Checklist

### Setup Checklist
- [ ] Install dependencies (`pnpm install`)
- [ ] Copy .env.example to .env.local
- [ ] Fill in Supabase credentials
- [ ] Initialize database
- [ ] Create owner account
- [ ] Start dev server
- [ ] Access dashboard at localhost:3000

### Testing Checklist
- [ ] Test login endpoint
- [ ] Test register endpoint
- [ ] Test key generation
- [ ] Test key validation
- [ ] Test balance operations
- [ ] Test role changes
- [ ] Test invitations
- [ ] Test permissions

### Deployment Checklist
- [ ] Set all environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up backups
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Monitor after deployment

## 🎓 Learning Path

1. **Beginner**: Read [README.md](./README.md) → Follow [SETUP.md](./SETUP.md)
2. **Intermediate**: Test endpoints using [TESTING.md](./TESTING.md)
3. **Advanced**: Integrate using [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. **Expert**: Deploy and monitor (see [SETUP.md](./SETUP.md))

## 📚 Document Overview

| Document | Purpose | Read When |
|----------|---------|-----------|
| [README.md](./README.md) | Overview | First thing |
| [SETUP.md](./SETUP.md) | Installation | Before starting dev |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API details | When building integration |
| [TESTING.md](./TESTING.md) | Testing | Before deployment |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Complete reference | For detailed info |
| [INDEX.md](./INDEX.md) | Navigation | Finding information |
| [.env.example](./.env.example) | Configuration | During setup |

---

**Start with [README.md](./README.md), then move to [SETUP.md](./SETUP.md)**

Good luck! 🚀
