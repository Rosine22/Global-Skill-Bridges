# 📧 Gmail Email Setup for Password Recovery

## 🚀 Step-by-Step Gmail Setup (5 minutes)

Follow these exact steps to enable Gmail email sending for password recovery:

### Step 1: Enable 2-Factor Authentication on Your Gmail

1. Go to your **Google Account Settings**: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under **Signing in to Google**, click **2-Step Verification**
4. Follow the steps to enable 2FA (if not already enabled)

### Step 2: Generate an App Password

1. Go to **App passwords**: https://myaccount.google.com/apppasswords
2. In the dropdown, select **Mail**
3. In the device dropdown, select **Other** and type "Global Skills Bridge"
4. Click **Generate**
5. **Copy the 16-character password** that appears (like: `abcd efgh ijkl mnop`)

### Step 3: Update Your .env File

Open your `.env` file in the `backend` folder and replace these lines:

```bash
# Change these lines:
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here

# To your actual values:
SMTP_USER=youractual@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

**Example:**
```bash
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

### Step 4: Test Email Sending

1. **Start your backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start your frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test password recovery**:
   - Go to `/login` in your browser
   - Click **"Forgot your password?"**
   - Enter any email address (it will send to the Gmail you configured)
   - Check your Gmail inbox!

## 📧 What Will Happen

Once configured, when users request password recovery:

1. **They enter their email** on the forgot password page
2. **Your Gmail account will send** a professional email to them
3. **The email will come FROM** your Gmail address
4. **The email contains** a secure reset link that expires in 1 hour

## 🔧 Important Notes

- **The FROM address** will be your Gmail address (SMTP_USER)
- **All password reset emails** will be sent from your Gmail
- **Gmail has sending limits**: ~500 emails/day for free accounts
- **For production**: Consider using SendGrid, Mailgun, or AWS SES

## 🎨 Email Preview

Users will receive a beautiful email like this:

```
From: yourgmail@gmail.com
Subject: 🔐 Reset your Global Skills Bridge password

🔐 Reset Your Password - Global Skills Bridge

Hello John,

We received a request to reset your password for your 
Global Skills Bridge account.

[Reset My Password] ← Big button with secure link

🔒 Security Information:
• This link will expire in 1 hour
• If you didn't request this, ignore this email
• Choose a strong, unique password

Best regards,
The Global Skills Bridge Security Team
```

## ✅ Verification Steps

After setup, check:
1. ✅ Backend starts without email errors
2. ✅ Forgot password form accepts email
3. ✅ Success message appears
4. ✅ Email arrives in Gmail inbox (check spam folder too)
5. ✅ Reset link works and redirects properly

## 🚨 Troubleshooting

**If emails don't send:**
- Check your App Password is correct (no spaces)
- Make sure 2FA is enabled on Gmail
- Check backend console for error messages
- Verify Gmail allows "Less secure app access" (should not be needed with App Password)

**If you see "Invalid credentials":**
- Double-check your Gmail address in SMTP_USER
- Regenerate a new App Password and try again

Ready to test? Update your `.env` file and restart your backend server!