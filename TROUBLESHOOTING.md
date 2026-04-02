# Troubleshooting Guide

## Login Issues

### Problem: "Login stuck on page with no error message"

**Solution:**
1. Open browser console (F12 or Right Click → Inspect → Console)
2. Look for error messages starting with `[v0]`
3. Check the Network tab to see the API response

### Problem: "Invalid username or password" error appears

**Possible causes:**
1. **User doesn't exist** - Make sure you registered first or use the default owner account
2. **Wrong password** - Check your password (case-sensitive)
3. **Database not initialized** - Run the setup script

**Fix:**
```bash
# Option 1: Create Owner account
node scripts/create-owner.js

# Option 2: Initialize database from scratch
node scripts/init-db.js
```

### Problem: Network/Database Errors

**Symptoms:**
- "Internal server error" message
- API calls fail
- Database connection errors in console

**Solutions:**

1. **Check Supabase Connection:**
   - Go to project Settings → Vars
   - Verify `NEXT_PUBLIC_SUPABASE_URL` exists
   - Verify `SUPABASE_SERVICE_ROLE_KEY` exists
   - Both should have values (not empty)

2. **Check Database Status:**
   ```bash
   # Re-initialize the database
   node scripts/init-db.js
   ```

3. **Check Logs:**
   - Open browser Console (F12)
   - Look for detailed error messages
   - Check Network tab for API responses

## Registration Issues

### Problem: "Invitation code not valid/invalid"

**Solutions:**
1. **Generate new invitation:**
   ```bash
   node scripts/create-owner.js
   ```
   Copy the invitation code exactly as shown

2. **Check code expiration:**
   - Invitation codes expire after 30 days
   - Generate a new one if needed

3. **One-time use:**
   - Each invitation code can only be used once
   - If already used, generate a new one

### Problem: "Username already taken"

**Solution:**
Use a different username - usernames must be unique

## Database Issues

### Check if Tables Exist

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should show:
- users
- api_keys
- invitations
- transactions

### Reset Database (Nuclear Option)

If everything is broken, reset and reinitialize:

```bash
# Drop all tables (CAREFUL!)
node scripts/init-db.js

# This will recreate all tables and constraints
```

## Common Error Messages

### "Invalid credentials"
- Username or password is wrong
- User account doesn't exist
- Try registering a new account with an invitation code

### "Invitation code invalid"
- Code doesn't exist
- Code was already used
- Code has expired (30 days)
- Generate a new invitation code

### "Username required" / "Password required"
- Left the field empty
- Fill in both username and password fields

### "Internal server error"
- Database connection issue
- Invalid environment variables
- API endpoint error
- Check browser console for detailed logs

## Environment Variables Checklist

In the Settings → Vars panel, you should have:

```
✓ NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
✓ SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
```

If any are missing:
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the URL and keys
4. Paste them in v0 Settings → Vars

## Debug Mode

Add this to your browser console to see detailed logs:

```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');
location.reload();
```

Then check the console for [v0] prefixed messages.

## Contact Support

If you still have issues:

1. Check Vercel logs: Settings → Logs
2. Check Supabase logs: Dashboard → Logs
3. Open browser console (F12) and check for errors
4. Try a different browser
5. Clear browser cache and cookies

## Quick Checklist

Before reporting issues, verify:

- [ ] Supabase integration is connected (Settings → Integrations)
- [ ] Environment variables are set (Settings → Vars)
- [ ] Database was initialized (`node scripts/init-db.js`)
- [ ] Owner account was created (`node scripts/create-owner.js`)
- [ ] Trying correct username/password
- [ ] Browser console shows no errors
- [ ] Internet connection is working
- [ ] App is running (`pnpm dev`)
