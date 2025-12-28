# 🔐 Username/Password Authentication - Security & Privacy

## Overview

Logbook Generator sekarang menggunakan **Username & Password login** yang paling mudah untuk user!

## ✅ How It Works

### Simple 3-Step Process:

```
1. User enters:
   - Aktivitas ID
   - IPB Username
   - IPB Password
   ↓
2. Backend logs in to IPB Portal
   - Obtains session cookies
   - Never stores credentials
   ↓
3. Cookies returned to frontend
   - Used for logbook submission
   - Auto-proceeds to Step 2
```

## 🔒 Security Guarantees

### What We DO:
✅ **Login on Your Behalf**: We login to IPB Portal directly using your credentials
✅ **Extract Cookies**: We obtain session cookies needed for submission
✅ **Return Cookies**: Cookies are sent back to your browser
✅ **Immediate Disposal**: Credentials are discarded immediately after login

### What We DON'T DO:
❌ **Never Store**: Your username and password are NEVER saved to database
❌ **Never Log**: Credentials are not written to any log files
❌ **Never Share**: Your data is never sent to third parties
❌ **Never Cache**: No caching of sensitive information

## 🛡️ Technical Security Measures

### 1. **In-Memory Only**
```typescript
// Credentials exist only in function scope
const { username, password } = await request.json();
// After function ends, they're garbage collected
```

### 2. **HTTPS Encryption**
- All communication encrypted in transit
- Credentials never sent in plain text
- Secure connection to IPB Portal

### 3. **No Persistence**
- No database storage
- No file system writes
- No session storage
- No cookies for credentials

### 4. **Minimal Logging**
```typescript
// Only log username (not password) for debugging
console.log('Login attempt for user:', username);
// Password is NEVER logged
```

## 🔍 What Happens to Your Data

### During Login:
1. **Frontend** → **Backend**: Credentials sent via HTTPS POST
2. **Backend** → **IPB Portal**: Login request with credentials
3. **IPB Portal** → **Backend**: Session cookies returned
4. **Backend** → **Frontend**: Cookies sent back
5. **Credentials Destroyed**: Immediately garbage collected

### After Login:
- Credentials no longer exist in memory
- Only session cookies remain (in browser)
- Cookies used for logbook submission
- Cookies cleared when you close browser

## 📊 Comparison with Other Methods

| Method | Ease of Use | Security | Privacy |
|--------|-------------|----------|---------|
| **Username/Password** | ⭐⭐⭐⭐⭐ | ✅ Secure | ✅ Private |
| Manual Cookies | ⭐⭐ | ✅ Secure | ✅ Private |
| Chrome Extension | ⭐⭐⭐⭐ | ✅ Secure | ✅ Private |

## ⚠️ Important Notes

### Trust Factor:
- **Open Source**: You can review our code
- **No Third Party**: Direct connection to IPB Portal
- **Transparent**: Clear about what we do

### Recommendations:
1. ✅ **Use HTTPS**: Always access via `https://`
2. ✅ **Verify URL**: Make sure you're on the correct domain
3. ✅ **Check Code**: Review our source code if concerned
4. ⚠️ **Public Computers**: Avoid using on shared/public computers

## 🔐 For the Paranoid (Extra Verification)

### Check Network Traffic:
1. Open DevTools (F12)
2. Go to Network tab
3. Watch the `/api/auth/login` request
4. Verify it only goes to our server
5. Verify credentials are not logged anywhere

### Check Source Code:
```bash
# View the login API code
cat app/api/auth/login/route.ts

# Search for any database writes
grep -r "database\|db\|save\|store" app/api/auth/
```

### Run Locally:
```bash
# Run on your own machine
npm run dev

# All processing happens locally
# No external servers involved
```

## 🆚 Why Not Just Use Cookies?

### Username/Password Advantages:
- ✅ **Easier**: No DevTools needed
- ✅ **Faster**: One-click login
- ✅ **Familiar**: Standard login flow
- ✅ **Mobile-Friendly**: Works on phones

### Cookie Method Advantages:
- ✅ **More Control**: You handle credentials
- ✅ **No Backend**: Direct browser-to-IPB
- ✅ **Zero Trust**: Don't trust our server

**Both methods are equally secure!** Choose based on your comfort level.

## 🚨 Red Flags to Watch For

If you see any of these, **STOP** and report:
- ❌ Credentials stored in localStorage
- ❌ Credentials sent to external domains
- ❌ Database writes with credentials
- ❌ Credentials in URL parameters
- ❌ Credentials in console logs

## 💡 How to Verify Our Claims

### 1. Check Network Requests:
```javascript
// In browser console
performance.getEntries()
  .filter(e => e.name.includes('login'))
  .forEach(e => console.log(e));
```

### 2. Check localStorage:
```javascript
// In browser console
console.log(localStorage);
console.log(sessionStorage);
// Should NOT contain credentials
```

### 3. Check Cookies:
```javascript
// In browser console
console.log(document.cookie);
// Should only contain IPB session cookies
```

## 📞 Questions or Concerns?

### Contact:
- **GitHub Issues**: Report security concerns
- **Code Review**: All code is open source
- **Audit**: Feel free to audit our code

### Transparency:
We believe in **radical transparency**. If you find any security issues, please report them immediately.

---

## 🎯 Bottom Line

**Your credentials are safe because:**
1. ✅ Never stored anywhere
2. ✅ Used only once for login
3. ✅ Immediately discarded
4. ✅ Encrypted in transit
5. ✅ Open source & auditable

**Trust, but verify!** Check our code yourself.

---

**Made with ❤️ and 🔒 for IPB Students**

*Your privacy and security are our top priorities.*
