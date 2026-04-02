# Key Generator Server

A comprehensive backend system for managing game API keys with role-based access control, balance management, and user invitations. Perfect for game key distribution platforms.

## ✨ Features

### 🎮 Game Support
- **CODM** - Call of Duty Mobile
- **MLBB** - Mobile Legends Bang Bang
- **HOK** - Honor of Kings
- **FF** - Free Fire
- **PUBG** - PUBG Mobile
- **VAL** - Valorant
- **GI** - Genshin Impact
- **AOV** - Arena of Valor

### 🔐 Role-Based Access Control
- **Owner**
  - Unlimited balance
  - Full user management
  - Change user roles
  - Create any invitation
  - View all transactions

- **Admin**
  - Unlimited balance
  - Manage users (except Owner)
  - Cannot change roles
  - Create reseller invitations
  - View all transactions
  - Transfer balances

- **Reseller**
  - Max balance: 9,999,999,999,999,999
  - Buy balance from Owner/Admin
  - View own API keys
  - Track transactions

### 🔑 API Key Management
- Generate unique API keys per game
- Expiration tracking (days valid)
- Serial number validation
- Key revocation
- Status checking
- Active/inactive toggles

### 💰 Balance System
- Unlimited balance for Owner/Admin
- Limited balance for Resellers
- Balance transfer between users
- Transaction history
- Balance add/deduct operations
- Real-time balance tracking

### 📨 Invitation System
- Generate invitation codes
- Role-based invitations
- Expiration dates
- Revocation capability
- Usage tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- pnpm or npm

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd key-generator-server

# Install dependencies
pnpm install

# Set up environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
# ... (see SETUP.md for complete list)

# Initialize database
node scripts/init-db.js

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to access the dashboard.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register with invitation code

### Key Management
- `POST /api/connect` - Validate/generate/revoke/check API keys (main endpoint)

### User Management
- `GET /admin/users` - List all users (Owner/Admin)
- `POST /admin/balance` - Manage user balance
- `POST /admin/role` - Change user role (Owner only)

### Invitations
- `POST /admin/invitations` - Create/list/revoke invitations

## 📋 Main /connect Endpoint

The `/connect` endpoint is the core of the system:

```bash
curl -X POST https://yourdomain.com/api/connect \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "validate",
    "api_key": "your_key",
    "serial_number": "CODM-xxx-xxx",
    "key_type": "CODM"
  }'
```

**Actions:**
- `validate` - Check if key is valid and active
- `generate` - Create new API key
- `check` - Get key details
- `revoke` - Disable a key

## 🗄️ Database Schema

### Users Table
- id (UUID)
- username (string, unique)
- password_hash (string)
- role (owner | admin | reseller)
- balance (bigint)
- created_at, updated_at

### API Keys Table
- id (UUID)
- user_id (FK to users)
- key_type (CODM | MLBB | HOK | FF | PUBG | VAL | GI | AOV)
- api_key (hex string)
- serial_number (unique)
- days_valid (int)
- is_active (boolean)
- expires_at, created_at, revoked_at

### Invitations Table
- id (UUID)
- created_by (FK to users)
- code (unique)
- role (owner | admin | reseller)
- is_used (boolean)
- used_by, used_at
- created_at, expires_at

### Transactions Table
- id (UUID)
- from_user_id, to_user_id (FK to users)
- amount (bigint)
- transaction_type (BALANCE_SET | BALANCE_ADD | BALANCE_DEDUCT | BALANCE_TRANSFER | ROLE_CHANGED)
- description (text)
- created_at

## 🔒 Security Features

- SHA256 password hashing
- JWT token authentication (30-day expiration)
- 32-byte random API key generation
- Serial number validation
- Row Level Security (RLS) on database tables
- Input validation and sanitization
- Transaction audit trail
- Role-based permissions

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete installation and configuration guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Detailed API reference with examples

## 💻 Technology Stack

- **Framework**: Next.js 16
- **Frontend**: React 19 + TypeScript
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT
- **Password Hashing**: SHA256
- **Styling**: Tailwind CSS

## 🎯 Use Cases

1. **Game Distribution Platform** - Manage API keys for multiple games
2. **Game Account Service** - Distribute and validate game accounts
3. **Reseller Management** - Handle reseller accounts and balance system
4. **Multi-tenant System** - Support multiple roles with different permissions
5. **Key Licensing System** - Track and manage key expiration

## 📈 Dashboard Features

### Home Tab
- Account overview
- Balance display
- Role information
- Supported games list

### Users Tab (Owner/Admin)
- User management interface
- Balance adjustment
- Role management
- User activity tracking

### Invitations Tab (Owner/Admin)
- Create invitation codes
- List active invitations
- Revoke invitations
- Track invitation usage

### Keys Tab
- View generated API keys
- Copy keys to clipboard
- Track key expiration
- Check key status

## 🔄 Workflow Example

1. **Owner creates Admin invitation**
   ```
   POST /admin/invitations
   role: "admin", expires_in_days: 7
   ```

2. **Admin registers with invitation**
   ```
   POST /auth/register
   username: "admin1", password: "pass123", invitation_code: "ABC123..."
   ```

3. **Admin creates Reseller invitations**
   ```
   POST /admin/invitations
   role: "reseller", expires_in_days: 30
   ```

4. **Reseller registers**
   ```
   POST /auth/register
   username: "reseller1", password: "pass123", invitation_code: "XYZ789..."
   ```

5. **Owner adds balance to Reseller**
   ```
   POST /admin/balance
   action: "add", target_user_id: "uuid", amount: 1000000
   ```

6. **Reseller generates API key**
   ```
   POST /connect
   action: "generate", user_id: "uuid", key_type: "CODM", days_valid: 30
   ```

7. **Client validates key**
   ```
   POST /connect
   action: "validate", api_key: "xxx", serial_number: "CODM-xxx", key_type: "CODM"
   ```

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
Works on AWS, Google Cloud, DigitalOcean, Heroku, etc.

## 🔧 Configuration

Key environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
POSTGRES_URL
```

See **[SETUP.md](./SETUP.md)** for complete configuration guide.

## 📝 License

This project is provided as-is for use with game key distribution.

## 🤝 Support

For detailed information:
1. Check [SETUP.md](./SETUP.md) for installation
2. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
3. Review error messages and status codes

## 🎓 Example Integration

### JavaScript/Node.js
```javascript
// Validate a key
const response = await fetch('https://yourdomain.com/api/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'validate',
    api_key: 'key_hex',
    serial_number: 'CODM-...',
    key_type: 'CODM'
  })
});
const result = await response.json();
console.log(result.valid); // true or false
```

### Python
```python
import requests

response = requests.post('https://yourdomain.com/api/connect', json={
    'action': 'validate',
    'api_key': 'key_hex',
    'serial_number': 'CODM-...',
    'key_type': 'CODM'
})
result = response.json()
print(result['valid'])
```

---

**Built with ❤️ using Next.js 16 and Supabase**
