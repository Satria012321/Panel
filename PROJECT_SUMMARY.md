# Key Generator Server - Project Summary

## 🎯 Project Overview

A complete, production-ready backend system for managing game API keys with role-based access control, balance management, and user invitation system. Supports 8 popular games with comprehensive API endpoints.

## 📦 What's Included

### Core Files
```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          # User authentication
│   │   │   └── register/route.ts       # New user registration
│   │   ├── admin/
│   │   │   ├── users/route.ts          # User management
│   │   │   ├── balance/route.ts        # Balance operations
│   │   │   ├── role/route.ts           # Role management
│   │   │   └── invitations/route.ts    # Invitation system
│   │   └── connect/route.ts            # Main key validation endpoint
│   ├── page.tsx                        # Dashboard UI
│   ├── layout.tsx                      # Root layout
│   └── globals.css                     # Global styles
├── lib/
│   ├── auth.ts                         # Authentication utilities
│   ├── api-client.ts                   # JavaScript SDK for integration
│   └── utils.ts                        # Helper functions
├── scripts/
│   ├── 01-init-schema.sql              # Database migration
│   └── init-db.js                      # Database initialization script
├── public/                             # Static assets
├── components/ui/                      # Pre-installed shadcn components
├── hooks/                              # React hooks (use-toast, use-mobile)
├── README.md                           # Project overview
├── SETUP.md                            # Installation & configuration guide
├── API_DOCUMENTATION.md                # Complete API reference
├── TESTING.md                          # Testing guide with examples
└── PROJECT_SUMMARY.md                  # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
SUPABASE_JWT_SECRET=your_secret
POSTGRES_URL=your_postgres_url
# ... see SETUP.md for all variables
```

### 3. Initialize Database
```bash
node scripts/init-db.js
```

### 4. Start Development
```bash
pnpm dev
```

### 5. Access Dashboard
Open `http://localhost:3000`

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

## 🔐 Role-Based Access Control

### Owner
- Full system access
- Unlimited balance
- Create any invitation
- Manage all users
- Change any role
- View all transactions
- Manage all API keys

### Admin
- Unlimited balance
- Manage users (except Owner)
- Create reseller invitations
- Add/deduct balances
- View all transactions
- Cannot change roles

### Reseller
- Limited balance (max: 9,999,999,999,999,999)
- Buy balance from Owner/Admin
- View own API keys
- View own transactions
- Cannot manage other users

## 📡 Main API Endpoints

### Authentication
```
POST /api/auth/login         - User login with JWT token
POST /api/auth/register      - Register with invitation code
```

### Key Management (Main /connect endpoint)
```
POST /api/connect            - Validate/generate/revoke/check API keys
  - action: "validate"       - Check if key is valid
  - action: "generate"       - Create new API key
  - action: "check"          - Get key details
  - action: "revoke"         - Disable a key
```

### Admin Features
```
GET /admin/users             - List all users (Owner/Admin)
POST /admin/balance          - Manage user balance
  - action: "set"            - Set balance to amount (Owner)
  - action: "add"            - Add to balance (Owner/Admin)
  - action: "deduct"         - Deduct from balance (Owner/Admin)
  - action: "transfer"       - Transfer between users (Owner/Admin)
POST /admin/role             - Change user role (Owner only)
POST /admin/invitations      - Create/list/revoke invitations
  - action: "create"         - Generate new invitation
  - action: "list"           - View invitations
  - action: "revoke"         - Expire invitation
```

## 💾 Database Schema

### users
- id (UUID, PK)
- username (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (owner | admin | reseller)
- balance (BIGINT)
- created_at, updated_at

### api_keys
- id (UUID, PK)
- user_id (FK)
- key_type (CODM | MLBB | HOK | FF | PUBG | VAL | GI | AOV)
- api_key (VARCHAR, UNIQUE)
- serial_number (VARCHAR, UNIQUE)
- days_valid (INT)
- is_active (BOOLEAN)
- expires_at, created_at, revoked_at

### invitations
- id (UUID, PK)
- created_by (FK)
- code (VARCHAR, UNIQUE)
- role (owner | admin | reseller)
- is_used (BOOLEAN)
- used_by (FK), used_at
- created_at, expires_at

### transactions
- id (UUID, PK)
- from_user_id, to_user_id (FK)
- amount (BIGINT)
- transaction_type (VARCHAR)
- description (TEXT)
- created_at

## 🔒 Security Features

- ✓ SHA256 password hashing
- ✓ JWT token authentication (30-day expiration)
- ✓ 32-byte random API key generation
- ✓ Serial number validation
- ✓ Row Level Security (RLS) on database
- ✓ Role-based permissions
- ✓ Transaction audit trail
- ✓ Input validation
- ✓ HTTPS ready

## 🛠️ Technology Stack

- **Framework**: Next.js 16
- **Frontend**: React 19 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT + SHA256
- **Styling**: Tailwind CSS + shadcn themes
- **Icons**: Lucide React

## 📚 Documentation

### Files to Read
1. **README.md** - Project overview and features
2. **SETUP.md** - Installation and configuration
3. **API_DOCUMENTATION.md** - Complete API reference with examples
4. **TESTING.md** - Testing guide with cURL examples
5. **PROJECT_SUMMARY.md** - This file

## 🎯 Key Features

### API Key Management
- Generate unique keys per game
- Set expiration in days
- Serial number validation
- Key revocation
- Status checking
- Active/inactive status

### Balance System
- Unlimited for Owner/Admin
- Limited for Resellers
- Transfer between users
- Transaction history
- Real-time balance tracking
- Add/deduct operations

### Invitation System
- Generate invitation codes
- Role-based assignments
- Expiration management
- Revocation capability
- Usage tracking
- Audit trail

### User Management
- Create users with invitations
- Change user roles
- View user details
- Transaction history
- Balance management
- Role-based permissions

## 🚢 Deployment

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
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- DigitalOcean
- Heroku

## 📊 Example Workflow

1. **Owner creates Admin invitation**
   ```json
   POST /admin/invitations
   { "action": "create", "role": "admin" }
   ```

2. **Admin registers with code**
   ```json
   POST /auth/register
   { "username": "admin1", "invitation_code": "ABC123..." }
   ```

3. **Admin creates Reseller invitation**
   ```json
   POST /admin/invitations
   { "action": "create", "role": "reseller" }
   ```

4. **Reseller registers**
   ```json
   POST /auth/register
   { "username": "reseller1", "invitation_code": "XYZ789..." }
   ```

5. **Owner adds balance to Reseller**
   ```json
   POST /admin/balance
   { "action": "add", "target_user_id": "...", "amount": 1000000 }
   ```

6. **Reseller generates API key**
   ```json
   POST /api/connect
   { "action": "generate", "user_id": "...", "key_type": "CODM", "days_valid": 30 }
   ```

7. **Client validates key**
   ```json
   POST /api/connect
   { "action": "validate", "api_key": "...", "serial_number": "...", "key_type": "CODM" }
   ```

## 🐛 Troubleshooting

### Database Connection Failed
- Check DATABASE_URL is correct
- Verify IP whitelist in Supabase
- Check PostgreSQL credentials

### Authentication Errors
- Ensure JWT_SECRET matches Supabase
- Check token hasn't expired (30 days)
- Verify password is hashed correctly

### Key Validation Returns Invalid
- Check serial number matches exactly
- Verify key hasn't been revoked
- Confirm key_type is valid (CODM, MLBB, etc.)
- Check key hasn't expired

### Balance Management Issues
- Verify user exists in database
- Check balance limits for reseller
- Ensure sufficient balance when deducting
- Verify role-based permissions

## 📞 Support Resources

1. **API_DOCUMENTATION.md** - Endpoint details and examples
2. **TESTING.md** - Test cases and cURL examples
3. **SETUP.md** - Installation troubleshooting
4. **Code Comments** - Inline documentation

## ✅ Testing Checklist

- [ ] Login/Register functionality
- [ ] API key generation for all 8 games
- [ ] Key validation (valid, invalid, expired)
- [ ] Key revocation
- [ ] User management
- [ ] Balance operations
- [ ] Role management
- [ ] Invitation system
- [ ] Permission enforcement
- [ ] Error handling

## 🎓 Integration Example

### JavaScript/Node.js
```javascript
import KeyGeneratorClient from './lib/api-client';

const client = new KeyGeneratorClient('https://your-domain.com/api');

// Login
const loginResult = await client.login('username', 'password');

// Generate key
const keyResult = await client.generateKey('user_id', 'CODM', 30);

// Validate key
const validResult = await client.validateKey(
  key.api_key,
  key.serial_number,
  'CODM'
);

console.log(validResult.valid); // true or false
```

## 🔄 Next Steps

1. **Install and Setup** - Follow SETUP.md
2. **Initialize Database** - Run init-db.js script
3. **Create Owner Account** - Insert into database
4. **Test APIs** - Use TESTING.md examples
5. **Deploy** - Use Vercel or Docker
6. **Monitor** - Check transaction logs regularly

## 📝 Notes

- All passwords are hashed with SHA256
- API keys are 32-byte hexadecimal strings
- Serial numbers include game type, timestamp, and random component
- Tokens expire after 30 days
- Row Level Security prevents unauthorized data access
- All changes are logged in transactions table

## 🎯 Production Checklist

- [ ] Change all default passwords
- [ ] Enable 2FA in Supabase
- [ ] Set strong JWT secret
- [ ] Configure CORS for your domains
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Monitor API usage
- [ ] Review transaction logs
- [ ] Set up error logging/monitoring
- [ ] Test all endpoints thoroughly
- [ ] Deploy to production
- [ ] Monitor after deployment

---

**Built with ❤️ using Next.js 16 and Supabase**

For more information, see README.md, SETUP.md, or API_DOCUMENTATION.md.
