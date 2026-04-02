## Login & Setup Guide

### Step 1: Create Owner Account & Get Invitation Code

Run this command in your terminal to create the initial Owner account and generate an invitation code for you:

```bash
node scripts/create-owner.js
```

**What this does:**
- Creates an Owner account (username: `owner`, password: `owner123`)
- Generates a unique invitation code for you to register as a Reseller
- Shows you the invitation code (save this!)

**Output example:**
```
✅ Owner account created successfully!

📋 Owner Login Credentials:
   Username: owner
   Password: owner123

🎟️  Invitation Code for You (Reseller):
   Code: 1A2B3C4D5E6F7G8H9I10
   Role: Reseller
   Expires: 4/1/2026, 4:00:00 PM

📝 Next Steps:
   1. Go to the app (http://localhost:3000)
   2. Click "Register" tab
   3. Enter your desired username and password
   4. Enter the invitation code: 1A2B3C4D5E6F7G8H9I10
   5. Click "Register"

✅ All set! Start using the app now!
```

---

### Step 2: Register as a Reseller

1. **Open the app** in your browser: `http://localhost:3000`
2. **Click the "Register" tab** at the top
3. **Fill in the form:**
   - Username: Enter your desired username (e.g., `myreseller`)
   - Password: Enter a secure password
   - Password Confirm: Confirm your password
   - Invitation Code: Paste the code you got from step 1
4. **Click "Register"**
5. You'll be automatically logged in as a Reseller!

---

### Step 3: Login as Owner (Optional)

If you want to manage other users later, you can login as the Owner:

1. **Click the "Login" tab**
2. **Enter credentials:**
   - Username: `owner`
   - Password: `owner123`
3. **Click "Login"**

As an Owner, you can:
- View all users
- Manage user balances (unlimited)
- Create invitations for new users
- Change user roles
- View all transactions

---

## User Roles Explained

### Owner
- **Balance:** Unlimited (999,999,999,999,999)
- **Can do:**
  - Manage all users
  - Change user roles
  - Create invitations with any role
  - Modify user balances
  - View all transactions
  - Generate API keys for all games

### Admin
- **Balance:** Unlimited
- **Can do:**
  - Manage users (except Owner)
  - Create invitations for Resellers only
  - Modify user balances
  - View all transactions
  - Generate API keys for all games
  - **Cannot:** Change Owner's role

### Reseller
- **Balance:** Limited (Max 9,999,999,999,999,999)
- **Can do:**
  - Generate API keys for games
  - View their own balance
  - See their own transactions
  - **Cannot:** Manage users or create invitations

---

## Creating More Users

### As Owner:

1. **Go to "Invitations" tab**
2. **Click "Create New Invitation"**
3. **Fill in:**
   - Role: Choose `owner`, `admin`, or `reseller`
   - Expiration: Set how many days until it expires
4. **Click "Generate Code"**
5. **Share the code** with whoever should register

### As Admin:

1. **Go to "Invitations" tab**
2. **Can only create invitations** for `reseller` role
3. **Follow same steps as Owner**

---

## Default Credentials Summary

| Account Type | Username | Password | Balance |
|---|---|---|---|
| Owner | `owner` | `owner123` | Unlimited |
| Your Account | (you choose) | (you choose) | 0 (as Reseller) |

---

## Troubleshooting

### "Invitation Code is invalid"
- Make sure you copied the full code correctly
- Check that the code hasn't expired (usually 30 days)
- The code can only be used once

### "Username already exists"
- Choose a different username
- Usernames are unique across the system

### "Password must be at least 6 characters"
- Enter a longer password

### "Can't create invitation as Admin"
- Admins can only create Reseller invitations
- You need to be Owner to create Admin invitations

---

## API Key Generation

Once logged in, you can generate API keys for these games:

1. **CODM** - Call of Duty Mobile
2. **MLBB** - Mobile Legends Bang Bang
3. **HOK** - Honor of Kings
4. **FF** - Free Fire
5. **PUBG** - PUBG Mobile
6. **VAL** - Valorant
7. **GI** - Genshin Impact
8. **AOV** - Arena of Valor

Go to "Home" tab → "Generate API Key" section to create keys.

---

## Need Help?

Check these files:
- `README.md` - Project overview
- `API_DOCUMENTATION.md` - API endpoint details
- `TESTING.md` - Testing examples
- `SETUP.md` - Installation guide
