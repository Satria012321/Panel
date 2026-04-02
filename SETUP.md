# Key Generator Server - Setup Guide

## Prerequisites
- Node.js 18+ (Next.js 16 requirement)
- Supabase account and project
- npm or pnpm package manager

## Installation Steps

### 1. Clone or Download the Project
```bash
git clone <repository-url>
cd key-generator-server
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Environment Setup

#### Create `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=postgres
POSTGRES_HOST=your-project.db.supabase.co
```

**To find these values:**
1. Go to Supabase Dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the URLs and keys from there
5. Go to **Database** section for PostgreSQL credentials

### 4. Database Initialization

#### Option A: Using Supabase Dashboard SQL Editor
Copy and paste the contents of `scripts/01-init-schema.sql` into the SQL editor and execute.

#### Option B: Using Node.js Script
```bash
# Run the initialization script
node scripts/init-db.js
```

### 5. Create Initial Owner Account

You can directly insert an owner account into the database using Supabase SQL Editor:

```sql
INSERT INTO users (username, password_hash, role, balance)
VALUES ('owner', sha256('your_password'), 'owner', 999999999999999999);
```

Or use the API by creating a user record manually and then logging in.

### 6. Run Development Server
```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

### 7. Verify Installation

1. Navigate to `http://localhost:3000`
2. You should see the login page
3. Login with your owner account credentials
4. Visit `/api/connect` to see the API status

## Configuration

### JWT Secret
The application uses your Supabase JWT secret for token generation. This is critical for production.

**To regenerate:**
1. In Supabase dashboard, go to **Settings** → **API**
2. Look for `SUPABASE_JWT_SECRET`
3. Update in `.env.local`

### Database Rules

The schema includes:
- **users** - User accounts with role and balance
- **api_keys** - Generated API keys with expiration
- **invitations** - Invitation codes for new registrations
- **transactions** - Transaction history for audit trail

### Role Permissions

#### Owner
- ✓ Unlimited balance
- ✓ Create/manage all users
- ✓ Change any user's role
- ✓ Create invitations for any role
- ✓ View all transactions
- ✓ Set user balances directly
- ✓ Manage API keys

#### Admin
- ✓ Unlimited balance
- ✓ Create/manage users (except Owner)
- ✗ Cannot change user roles
- ✓ Create reseller invitations
- ✓ View all transactions
- ✓ Add/deduct user balances
- ✓ Manage API keys

#### Reseller
- ✓ Limited balance (max: 9999999999999999)
- ✗ Cannot create users
- ✗ Cannot manage other users
- ✓ View own API keys
- ✓ View own transactions
- ✓ Buy balance from Owner/Admin
- ✓ Generate own API keys (pending implementation)

## First Time Setup Workflow

### 1. Start Application
```bash
pnpm dev
```

### 2. Create Owner Account
Login with your initial owner credentials (created in database initialization step)

### 3. Create Admin Account (Optional)
1. As Owner, go to Invitations tab
2. Create invitation with role "admin"
3. Share code with admin user
4. Admin creates account using that code

### 4. Create Reseller Accounts
1. As Owner/Admin, create invitations with role "reseller"
2. Send invitation codes to resellers
3. Resellers register and start buying keys

### 5. Manage Balances
1. As Owner/Admin, go to Balance Management
2. Add initial balance to resellers
3. Resellers can now purchase API keys

## API Testing

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"owner","password":"your_password"}'

# Get API status
curl http://localhost:3000/api/connect
```

### Using Postman
1. Import the provided API collection
2. Set environment variables with your token
3. Test each endpoint

## Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Important:** Before deploying:
1. Set all environment variables in Vercel project settings
2. Ensure database is accessible from production
3. Update CORS settings if needed

### Deploy to Other Platforms
The application is a standard Next.js 16 app and can be deployed to:
- Docker
- AWS (EC2, ECS, Lambda)
- Google Cloud Platform
- DigitalOcean
- Heroku

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is correct
- Ensure your IP is whitelisted in Supabase
- Verify database credentials in `.env.local`

### "JWT verification failed"
- Ensure `SUPABASE_JWT_SECRET` matches Supabase settings
- Check token hasn't expired (30 days)

### "Authentication failed"
- Verify username/password are correct
- Check user exists in database
- Ensure password is hashed with SHA256

### "API key validation returns INVALID"
- Check serial number matches exactly
- Verify key hasn't been revoked
- Confirm key_type is one of: CODM, MLBB, HOK, FF, PUBG, VAL, GI, AOV
- Check key hasn't expired

### "Balance update failed"
- Check user exists
- For reseller, ensure new balance doesn't exceed 9999999999999999
- Verify you have permission (Owner/Admin)
- Check for sufficient balance when deducting

## Backup & Maintenance

### Database Backups
1. Go to Supabase Dashboard
2. Select your project
3. Go to **Settings** → **Backups**
4. Configure automatic daily backups

### Monitoring
1. Check Supabase logs regularly
2. Monitor API usage in Next.js
3. Review transaction history for anomalies

## Security Best Practices

1. **Change default passwords** immediately after setup
2. **Enable 2FA** in Supabase
3. **Use strong passwords** (min 12 characters)
4. **Rotate JWT secrets** periodically
5. **Limit API access** by IP if possible
6. **Monitor suspicious activities** in transaction logs
7. **Enable HTTPS** in production
8. **Set up CORS** properly for your domains

## Next Steps

After setup:
1. Create your first admin/reseller accounts
2. Set initial balances
3. Generate API keys for different games
4. Test the `/connect` endpoint
5. Integrate with your game applications
6. Monitor usage and transactions

## Support

For issues or questions:
1. Check API_DOCUMENTATION.md for endpoint details
2. Review troubleshooting section above
3. Check Supabase documentation
4. Check Next.js documentation

## Version Information
- Next.js: 16.2.0
- React: 19.2.4
- Supabase: ^2.39.0
- Node.js: 18+
