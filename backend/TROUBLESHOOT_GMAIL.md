# 📧 Gmail Email Troubleshooting Guide

## Current Status
Your email is configured to use: **globalskills4@gmail.com**

## ⚠️ Common Issues & Solutions

### Issue #1: App Password Problems

**Symptoms:**
- Emails not being sent
- "Invalid credentials" error
- "Authentication failed" error

**Solutions:**

#### Step 1: Generate a NEW App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left menu)
3. Scroll to "2-Step Verification" - **MUST be turned ON**
4. Scroll down to "App passwords" and click it
5. Select "Mail" and "Windows Computer" (or Other)
6. Click "Generate"
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### Step 2: Update Your .env File
Open `backend/.env` and update:
```bash
SMTP_PASS=abcdefghijklmnop
```
**IMPORTANT:**
- ❌ NO spaces in the password
- ❌ NO quotes around the password
- ✅ Just the 16 characters without spaces

---

### Issue #2: Gmail Security Blocking

**Symptoms:**
- "Less secure app blocked" notification
- Emails work from other apps but not yours

**Solutions:**

1. **Check Gmail Settings:**
   - Go to https://mail.google.com/
   - Click Settings (gear icon) → "See all settings"
   - Go to "Forwarding and POP/IMAP" tab
   - Enable "IMAP access"
   - Click "Save Changes"

2. **Allow Node.js:**
   - Google might be blocking Node.js
   - Check your Gmail for "Critical security alert" emails
   - If you see one, click "Yes, it was me"

---

### Issue #3: Firewall or Antivirus Blocking

**Symptoms:**
- Connection timeout errors
- "ECONNREFUSED" errors

**Solutions:**

1. **Temporarily disable antivirus** and test
2. **Add exception** for Node.js in your firewall
3. **Try different SMTP port:**
   ```bash
   SMTP_PORT=465
   SMTP_SECURE=true
   ```

---

### Issue #4: Wrong Email Service Configuration

**Current Settings in emailService.js:**
```javascript
service: "gmail"  ← Correct
```

This is correct! No changes needed here.

---

## 🧪 Testing Steps

### Step 1: Test Basic Connection

Run this command in your backend folder:
```bash
node test-email.js
```

**Expected Output:**
```
✅ Email sent successfully!
Message ID: <some-id>
```

**If it fails:**
- Check the error message
- Verify app password is correct
- Ensure 2FA is enabled on Google Account

---

### Step 2: Test Employer Approval Email

Run:
```bash
node test-employer-approval-email.js
```

This will send 2 test emails to globalskills4@gmail.com

---

### Step 3: Check Gmail Inbox

**Look for emails from:**
- Sender: "Global Skills Bridge" <globalskills4@gmail.com>
- Subject: "✅ Your Employer Account Has Been Approved"
- Subject: "❌ Your Employer Account Has Been Rejected"

**Check these folders:**
1. Inbox
2. Spam/Junk
3. Promotions
4. Updates

---

## 🔧 Quick Fix Checklist

- [ ] 2-Step Verification is **ENABLED** on Google Account
- [ ] App Password is **GENERATED** and **FRESH** (not old)
- [ ] `.env` file has **NO SPACES** in SMTP_PASS
- [ ] `.env` file has **NO QUOTES** around SMTP_PASS
- [ ] IMAP is **ENABLED** in Gmail settings
- [ ] Backend server is **RESTARTED** after .env changes
- [ ] No "Critical security alert" emails from Google
- [ ] Checked **SPAM** folder in Gmail

---

## 🚀 Quick Test Commands

### Test 1: Verify .env is loaded correctly
```bash
cd backend
node -e "require('dotenv').config(); console.log('SMTP_USER:', process.env.SMTP_USER); console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET');"
```

### Test 2: Send a test email
```bash
node test-email.js
```

### Test 3: Test employer notification
```bash
node test-employer-approval-email.js
```

---

## 📝 Current Configuration

```
Email Service: Gmail
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Secure: false
From Email: globalskills4@gmail.com
Test Recipient: globalskills4@gmail.com
```

---

## ❓ Still Not Working?

### Alternative: Use Ethereal Email (for testing)

1. Go to https://ethereal.email/create
2. Copy the credentials
3. Update `.env`:
   ```bash
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your.ethereal.username@ethereal.email
   SMTP_PASS=your.ethereal.password
   ```
4. Run tests
5. View sent emails at https://ethereal.email/messages

---

## 🎯 Most Likely Solutions

**90% of email issues are caused by:**

1. **App Password with spaces** → Remove all spaces
2. **App Password with quotes** → Remove quotes
3. **Old/Expired App Password** → Generate new one
4. **2FA not enabled** → Enable 2-Step Verification first
5. **Server not restarted** → Restart after .env changes

---

## 📞 Need More Help?

If emails still don't work:

1. Check backend console for error messages
2. Look for "Error sending email:" in logs
3. Verify the error message
4. Share the specific error for more targeted help

Common error messages and solutions:
- "Invalid login" → App password wrong
- "ECONNREFUSED" → Firewall/network issue
- "ETIMEDOUT" → Network/firewall blocking
- "No recipients" → Email address format wrong
