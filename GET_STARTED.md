## Get Started in 5 Minutes! 🚀

### Prerequisites
- Node.js 16+ installed
- Supabase account configured
- Environment variables set in `.env.local`

---

## Step-by-Step Setup

### 1️⃣ Start the Application

```bash
pnpm dev
```

Wait for the server to start. You should see:
```
▲ Next.js 16.2.0
✓ Ready in 2.3s
```

Then open: http://localhost:3000

---

### 2️⃣ Create Owner Account & Your Invitation Code

In a **new terminal tab**, run:

```bash
node scripts/create-owner.js
```

You'll see something like:
```
✅ Owner account created successfully!

📋 Owner Login Credentials:
   Username: owner
   Password: owner123

🎟️  Invitation Code for You (Reseller):
   Code: A1B2C3D4E5F6G7H8I9J0
   Role: Reseller
   Expires: 4/1/2027, 4:00:00 PM

📝 Next Steps:
   1. Go to the app (http://localhost:3000)
   2. Click "Register" tab
   3. Enter your desired username and password
   4. Enter the invitation code: A1B2C3D4E5F6G7H8I9J0
   5. Click "Register"

✅ All set! Start using the app now!
```

**Save the invitation code!**

---

### 3️⃣ Register Your Account

1. **Go back to http://localhost:3000** in your browser
2. **Click the "Register" tab** (top of the page)
3. **Fill in the form:**
   - **Username:** Choose anything (e.g., `myreseller`)
   - **Password:** Choose a secure password
   - **Confirm Password:** Repeat the password
   - **Invitation Code:** Paste the code from step 2
4. **Click "Register"**
5. ✅ You're now logged in as a Reseller!

---

## What You Can Do Now

### As a Reseller (Your Account)
- Generate API keys for 8 games
- View your account balance
- See your transaction history
- Generate up to 16 API keys total

### As Owner (optional - to manage users)
1. Click the "Login" tab
2. Login with: **username:** `owner`, **password:** `owner123`
3. You can now:
   - View all users
   - Create invitations for others
   - Change user roles
   - Modify balances
   - Manage the system

---

## The Dashboard Explained

### Home Tab
- **Your Balance:** Shows your current balance
- **Your Info:** Username and role
- **Generate API Key:** Create keys for your games
- **Active Keys:** View your generated keys

### Users Tab (Owner/Admin Only)
- See list of all registered users
- View their balances and roles
- Edit their balances
- Change their roles (Owner can do this, Admin limited)

### Invitations Tab (Owner/Admin Only)
- Create invitation codes for new users
- Set the role for each invitation (Owner, Admin, Reseller)
- View past invitations
- Revoke unused invitations

### Settings (Future Expansion)
- Account settings
- Security options
- Preferences

---

## Supported Games

Generate API keys for these 8 games:

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

---

## Using the API

Once you have an API key, validate it by sending a request:

```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "key": "YOUR_API_KEY",
    "serialNumber": "SN_123456"
  }'
```

Response:
```json
{
  "valid": true,
  "keyType": "CODM",
  "daysRemaining": 30,
  "expiresAt": "2026-05-01T00:00:00Z",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Default Accounts

| Account | Username | Password | Role |
|---------|----------|----------|------|
| System | owner | owner123 | Owner |
| Your Account | (register) | (your choice) | Reseller |

---

## Troubleshooting

### Issue: "Missing environment variables"
**Solution:** Check your `.env.local` file has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Issue: "Invitation code is invalid"
**Solution:** 
- Double-check you copied the code correctly
- Make sure it hasn't expired (usually 30 days)
- Each code can only be used once

### Issue: "Username already exists"
**Solution:** Choose a different username

### Issue: "Database connection failed"
**Solution:** 
- Make sure Supabase is running
- Check your credentials in `.env.local`
- Run `node scripts/init-db.js` to initialize

---

## Next Steps

1. **Read detailed guide:** `LOGIN_GUIDE.md`
2. **API Integration:** `API_DOCUMENTATION.md`
3. **Testing examples:** `TESTING.md`
4. **Full reference:** `README.md`

---

## Database Initialize (If Needed)

If the database tables don't exist, run:

```bash
node scripts/init-db.js
```

This will create all necessary tables automatically.

---

## Production Deployment

Ready to deploy? Choose your platform:

### Vercel (Recommended)
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t key-generator .
docker run -p 3000:3000 key-generator
```

### Other Platforms
- AWS, Google Cloud, DigitalOcean, Heroku, etc.
- All support Node.js applications

---

## Support Files

| File | Purpose |
|------|---------|
| `LOGIN_GUIDE.md` | Detailed login & account creation |
| `API_DOCUMENTATION.md` | Complete API reference |
| `TESTING.md` | Testing examples & cURL commands |
| `QUICK_REFERENCE.md` | Quick lookup for all features |
| `SETUP.md` | Installation details |
| `README.md` | Full project overview |

---

## You're All Set! 🎉

1. **Develop:** Start building with your API keys
2. **Test:** Use the testing examples in `TESTING.md`
3. **Deploy:** Push to production with Vercel
4. **Scale:** Manage users and invitations as needed

**Questions?** Check the documentation files above.

Happy coding! 🚀
