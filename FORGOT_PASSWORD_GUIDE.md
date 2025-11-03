# Forgot Password Troubleshooting Guide

## 🔍 Understanding the Error

**Error Message:**
```json
{
  "success": false,
  "message": "Route GET /api/auth/forgot-password not found",
  "availableEndpoints": {...}
}
```

**Root Cause:** The endpoint only accepts **POST** requests, but you made a **GET** request.

---

## ✅ Correct Usage

### Method 1: Using the Frontend (Recommended)

1. Navigate to the forgot password page:
   ```
   http://localhost:5173/forgot-password
   ```

2. Enter the user's email address

3. Click "Send reset link"

4. Check the console logs in the backend terminal for the reset token (in development mode)

---

### Method 2: Testing with Postman

**Configuration:**
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/forgot-password`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "user@example.com"
  }
  ```

**Expected Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent",
  "resetToken": "abc123..." // Only in development mode
}
```

---

### Method 3: Testing with cURL

**Windows PowerShell:**
```powershell
$body = @{
    email = "user@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/forgot-password" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

**Command Prompt / Git Bash:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\"}"
```

---

### Method 4: Using the Test Script

We've created a test script for you:

```bash
cd backend
node test-forgot-password.js
```

This will:
- Check if the server is running
- Test the POST method (correct)
- Test the GET method (should fail)
- Show you the expected behavior

---

## 🚫 Common Mistakes

### ❌ Wrong: Using GET Request
```javascript
// This will NOT work
fetch('http://localhost:5000/api/auth/forgot-password')
  .then(res => res.json())
```

### ✅ Correct: Using POST Request
```javascript
// This WILL work
fetch('http://localhost:5000/api/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'user@example.com' })
}).then(res => res.json())
```

---

## 🔐 Why No Authentication Required?

The forgot-password endpoint is **PUBLIC** by design:

1. ✅ **Users who forgot their password can't log in** to authenticate
2. ✅ The endpoint is **rate-limited** to prevent abuse (3 attempts per 15 minutes)
3. ✅ For security, it **always returns success** even if the email doesn't exist
4. ✅ The actual **reset token is sent via email**, not in the response (except dev mode)

---

## 📧 Email Configuration

For the forgot password feature to work in production, ensure email is configured:

1. Check `backend/.env` file:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@globalskillsbridge.com
   ```

2. For Gmail, you need an **App Password**:
   - Enable 2-factor authentication
   - Generate app password at: https://myaccount.google.com/apppasswords
   - Use the app password (not your regular password)

3. See `GMAIL_SETUP.md` for detailed instructions

---

## 🧪 Testing the Complete Flow

### Step 1: Send Reset Request
```bash
POST /api/auth/forgot-password
{
  "email": "existing-user@example.com"
}
```

### Step 2: Check Backend Logs
In development mode, you'll see the reset token in console:
```
Password reset email sent to user@example.com: reset-token-here
```

### Step 3: Reset Password
```bash
PUT /api/auth/reset-password/{reset-token-from-step-2}
{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Step 4: Login with New Password
```bash
POST /api/auth/login
{
  "email": "existing-user@example.com",
  "password": "newpassword123"
}
```

---

## 🐛 Debugging Checklist

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Using POST method (not GET)
- [ ] Content-Type header is set to `application/json`
- [ ] Request body contains valid JSON with `email` field
- [ ] User with that email exists in the database
- [ ] Rate limit not exceeded (3 attempts per 15 minutes)
- [ ] Check backend console for logs

---

## 📱 Available Auth Endpoints

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/auth/register` | POST | ❌ No | Register new user |
| `/api/auth/login` | POST | ❌ No | Login user |
| `/api/auth/logout` | POST | ❌ No | Logout user |
| `/api/auth/me` | GET | ✅ Yes | Get current user |
| `/api/auth/forgot-password` | POST | ❌ No | Request password reset |
| `/api/auth/reset-password/:token` | PUT | ❌ No | Reset password with token |
| `/api/auth/change-password` | PUT | ✅ Yes | Change password (logged in) |
| `/api/auth/verify-email/:token` | POST | ❌ No | Verify email address |
| `/api/auth/refresh-token` | POST | ❌ No | Refresh access token |

---

## 💡 Quick Fix

If you're getting the 404 error, you're likely:

1. **Visiting the URL directly in browser** (browsers make GET requests by default)
2. **Using wrong HTTP method in your API testing tool**
3. **Frontend not sending POST request correctly**

**Solution:** Always use **POST** method with email in the request body!

---

## 📞 Need Help?

1. Run the test script: `node backend/test-forgot-password.js`
2. Check backend logs for errors
3. Verify user exists: Check MongoDB database
4. Test with known working email first

---

## 🎯 Quick Test Command

```powershell
# Windows PowerShell - Run this to test right now
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/forgot-password" -Method Post -Body '{"email":"test@example.com"}' -ContentType "application/json"
```

This should work immediately if your server is running! 🚀
