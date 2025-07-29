# SMTP Configuration Guide

This guide will help you set up email verification for the Blog Platform.

## Quick Setup

1. **Edit the SMTP configuration file:**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Edit the SMTP config file
   nano config/smtp-config.json
   ```

2. **Update the configuration with your email settings:**
   ```json
   {
     "smtp": {
       "host": "smtp.gmail.com",
       "port": 587,
       "secure": false,
       "auth": {
         "user": "your-email@gmail.com",
         "pass": "your-app-password"
       }
     },
     "email": {
       "from": "your-email@gmail.com",
       "fromName": "Blog Platform"
     }
   }
   ```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 3: Update Configuration
Replace the values in `config/smtp-config.json`:
- `user`: Your Gmail address
- `pass`: The 16-character app password (not your regular password)

## Other Email Providers

### Outlook/Hotmail
```json
{
  "smtp": {
    "host": "smtp-mail.outlook.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your-email@outlook.com",
      "pass": "your-password"
    }
  }
}
```

### Yahoo Mail
```json
{
  "smtp": {
    "host": "smtp.mail.yahoo.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your-email@yahoo.com",
      "pass": "your-app-password"
    }
  }
}
```

### Custom SMTP Server
```json
{
  "smtp": {
    "host": "your-smtp-server.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your-username",
      "pass": "your-password"
    }
  }
}
```

## Testing the Configuration

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Check the console output:**
   - ✅ Email service initialized successfully
   - ❌ Email service initialization failed

3. **Register a new user** and check if verification emails are sent

## Troubleshooting

### Common Issues

1. **"Email service initialization failed"**
   - Check your SMTP credentials
   - Verify the email provider settings
   - Ensure 2FA is enabled for Gmail

2. **"Authentication failed"**
   - Use app passwords for Gmail (not regular password)
   - Check if your email provider requires special settings

3. **"Connection timeout"**
   - Check your internet connection
   - Verify the SMTP host and port
   - Some networks block SMTP ports

### Security Notes

- Never commit your SMTP credentials to version control
- Use environment variables in production
- Regularly rotate app passwords
- Consider using a dedicated email service (SendGrid, Mailgun, etc.)

## Production Deployment

For production, consider using dedicated email services:

### SendGrid
```json
{
  "smtp": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "apikey",
      "pass": "your-sendgrid-api-key"
    }
  }
}
```

### Mailgun
```json
{
  "smtp": {
    "host": "smtp.mailgun.org",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your-mailgun-username",
      "pass": "your-mailgun-password"
    }
  }
}
```

## Environment Variables (Recommended for Production)

Create a `.env` file in the backend directory:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Blog Platform
```

Then update the email service to use environment variables instead of the JSON file. 