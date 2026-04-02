# Setup Checklist ✓

Complete these steps in order to get your system running:

## Phase 1: Start Server ⚙️

```
□ Open terminal in project directory
□ Run: pnpm dev
□ Wait for "Ready in X.Xs" message
□ Verify: http://localhost:3000 loads
```

**Expected Output:**
```
▲ Next.js 16.2.0
✓ Ready in 2.3s

Local:        http://localhost:3000
```

---

## Phase 2: Create Owner Account 👤

```
□ Open NEW terminal tab
□ Run: node scripts/create-owner.js
□ See "Owner account created" message
□ Copy the INVITATION CODE (long alphanumeric string)
```

**What You'll See:**
```
✅ Owner account created successfully!

📋 Owner Login Credentials:
   Username: owner
   Password: owner123

🎟️  Invitation Code for You (Reseller):
   Code: ABCD1234EF5678GH901IJ2K (← SAVE THIS!)
   Role: Reseller
   Expires: 4/1/2027
```

---

## Phase 3: Register Your Account 📝

```
□ Go to: http://localhost:3000
□ Click: "Register" tab
□ Enter username: (choose any name)
□ Enter password: (choose any password)
□ Confirm password: (repeat your password)
□ Invitation code: (paste code from Phase 2)
□ Click: "Register" button
```

**Result:** You'll be logged in as a Reseller ✓

---

## Phase 4: Verify Everything Works ✅

```
□ You see "Home" tab with your balance
□ "Generate API Key" section is visible
□ You can see "Users" tab (as Owner) or limited options (as Reseller)
□ No errors in browser console
```

---

## Success! You're Ready to Use 🎉

Now you can:

### As a Reseller (Your Account):
```
✓ Generate API keys for 8 games
✓ View your balance
✓ See your transactions
✓ Use API endpoints
```

### As Owner (Optional):
```
Login again with: username=owner, password=owner123
✓ Manage all users
✓ Create invitations
✓ Change user roles
✓ Modify balances
```

---

## File Guide 📚

After setup, read these in order:

1. **`LOGIN_GUIDE.md`** - How to login and create accounts
2. **`API_DOCUMENTATION.md`** - API endpoint details
3. **`TESTING.md`** - Test examples with cURL
4. **`QUICK_REFERENCE.md`** - Quick lookup
5. **`README.md`** - Full documentation

---

## Common Issues & Solutions 🔧

### Error: "Missing environment variables"
```
✗ Problem: .env.local not configured
✓ Solution: cp .env.example .env.local
           Add your Supabase credentials
```

### Error: "Cannot find module 'next'"
```
✗ Problem: Dependencies not installed
✓ Solution: pnpm install
           pnpm dev
```

### Error: "Database connection failed"
```
✗ Problem: Database not initialized
✓ Solution: node scripts/init-db.js
           Then run: node scripts/create-owner.js
```

### Error: "Invitation code is invalid"
```
✗ Problem: Wrong code or code expired
✓ Solution: Run create-owner.js again to get new code
           Use new code immediately
```

### Error: "Username already exists"
```
✗ Problem: Username is taken
✓ Solution: Choose different username
           Try: username_2, username_new, etc.
```

---

## Quick Reference

### Starting Server
```bash
pnpm dev              # Start development server
pnpm build           # Build for production
npm start            # Run production build
```

### Database
```bash
node scripts/init-db.js       # Initialize database
node scripts/create-owner.js  # Create owner & get invite code
```

### Default Logins
```
Owner:
  Username: owner
  Password: owner123

Your Account:
  Username: (what you registered)
  Password: (what you registered)
```

---

## Testing the API

### 1. Get Your API Key
```
Login → Home tab → Generate API Key → CODM
Copy the generated key
```

### 2. Test with cURL
```bash
curl -X POST http://localhost:3000/api/connect \
  -H "Content-Type: application/json" \
  -d '{
    "action": "validate",
    "key": "YOUR_KEY_HERE",
    "serialNumber": "TEST123"
  }'
```

### 3. Expected Response
```json
{
  "valid": true,
  "keyType": "CODM",
  "daysRemaining": 30,
  "expiresAt": "2026-05-01T00:00:00Z"
}
```

---

## Deployment Checklist

When ready to deploy:

```
□ Set environment variables on platform
□ Run: pnpm build
□ Verify no errors in build output
□ Test on deployed URL
□ Monitor logs for errors
```

---

## Final Checklist

```
✓ Server is running (Phase 1)
✓ Owner account created (Phase 2)
✓ Your account registered (Phase 3)
✓ Dashboard loads (Phase 4)
✓ Read LOGIN_GUIDE.md
✓ Ready to use API
```

---

**You're all set! Start building! 🚀**

For detailed instructions, see: `GET_STARTED.md`
For API details, see: `API_DOCUMENTATION.md`
For testing, see: `TESTING.md`
