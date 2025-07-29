# Security Configuration

This document explains the security measures implemented in the blog platform to protect sensitive data from being committed to version control.

## 🔒 .gitignore Configuration

The project uses comprehensive `.gitignore` files at multiple levels to ensure sensitive data is never committed to Git:

### Root Level (.gitignore)
- **Location**: `/blog-platform/.gitignore`
- **Purpose**: Project-wide protection
- **Scope**: All subdirectories and files

### Backend Level (.gitignore)
- **Location**: `/blog-platform/backend/.gitignore`
- **Purpose**: Backend-specific protection
- **Scope**: Backend files and data

### Frontend Level (.gitignore)
- **Location**: `/blog-platform/frontend/.gitignore`
- **Purpose**: Frontend-specific protection
- **Scope**: Frontend files and configuration

### Sample Blog Page (.gitignore)
- **Location**: `/blog-platform/sample-blog-page/.gitignore`
- **Purpose**: Sample app protection
- **Scope**: Sample app files and configuration

## 🛡️ Protected Data Types

### 1. Configuration Files
```
**/config/
**/config.js
**/config.json
**/*.config.js
**/*.config.json
**/smtp-config.json
**/openai-config.json
**/email-config.json
**/database-config.json
**/config-examples.js
```

### 2. Environment Variables & Secrets
```
.env
.env.*
*.env
**/.env
**/.env.*
**/*.env
```

### 3. API Keys & Credentials
```
**/*api-key*
**/*api_key*
**/*apikey*
**/*secret*
**/*password*
**/*credential*
**/*token*
**/*key*
```

### 4. User Data & Databases
```
**/data/
**/users.json
**/posts.json
**/prompts.json
**/verification-tokens.json
**/email-tokens.json
**/*.json
!**/package.json
!**/package-lock.json
!**/tsconfig.json
!**/jsconfig.json
```

### 5. Certificate Files & Keys
```
*.pem
*.key
*.crt
*.cert
*.p12
*.pfx
id_rsa
id_rsa.pub
id_ed25519
id_ed25519.pub
*.ppk
```

### 6. Log Files
```
*.log
**/logs/
**/log/
**/debug.log
**/error.log
**/access.log
```

### 7. Temporary & Test Files
```
**/test-*.js
**/*-test.js
**/test/
**/tests/
**/test-email.js
**/test-openai.js
**/test-passwords.js
```

## 🔧 Configuration Management

### Backend Configuration
The backend uses these configuration files (all protected by .gitignore):

1. **SMTP Configuration** (`backend/config/smtp-config.json`)
   - Email server credentials
   - SMTP settings
   - Email sender information

2. **OpenAI Configuration** (`backend/config/openai-config.json`)
   - OpenAI API key
   - Model settings
   - Generation parameters

### Frontend Configuration
The frontend uses these configuration files (all protected by .gitignore):

1. **Sample Blog Page Config** (`sample-blog-page/src/config.js`)
   - Backend URL
   - User selection
   - Display settings

## 📋 Setup Instructions

### For New Developers

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-platform
   ```

2. **Create configuration files** (these are ignored by Git)
   ```bash
   # Backend SMTP config
   cp backend/config/smtp-config.example.json backend/config/smtp-config.json
   
   # Backend OpenAI config
   cp backend/config/openai-config.example.json backend/config/openai-config.json
   
   # Sample blog page config
   cp sample-blog-page/src/config.example.js sample-blog-page/src/config.js
   ```

3. **Configure your settings**
   - Edit `backend/config/smtp-config.json` with your email credentials
   - Edit `backend/config/openai-config.json` with your OpenAI API key
   - Edit `sample-blog-page/src/config.js` with your desired user and backend URL

### For Production Deployment

1. **Environment Variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your production values
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   OPENAI_API_KEY=your_openai_key
   ```

2. **Configuration Files**
   - Ensure all config files are properly set for production
   - Use environment variables where possible
   - Never commit production credentials

## 🚨 Security Best Practices

### 1. Never Commit Sensitive Data
- ✅ Use `.gitignore` to prevent accidental commits
- ✅ Use environment variables for secrets
- ✅ Use configuration files for non-sensitive settings

### 2. Use Environment Variables
```javascript
// Good: Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Bad: Hardcode secrets
const apiKey = 'sk-1234567890abcdef';
```

### 3. Validate Configuration
```javascript
// Check if required config exists
if (!process.env.OPENAI_API_KEY) {
  console.error('OpenAI API key not found in environment variables');
  process.exit(1);
}
```

### 4. Use Template Files
- Create `.example` or `.template` files for configuration
- Document required fields and format
- Never include real credentials in templates

### 5. Regular Security Audits
- Review `.gitignore` files regularly
- Check for accidentally committed secrets
- Use tools like `git-secrets` or `pre-commit` hooks

## 🔍 Verification Commands

### Check What's Ignored
```bash
# Check if a file is ignored
git check-ignore config.js

# List all ignored files
git status --ignored
```

### Check for Sensitive Data
```bash
# Search for potential secrets in tracked files
git grep -i "password\|secret\|key\|token" -- ':!*.md'

# Check for API keys
git grep -i "sk-\|pk-\|api_key" -- ':!*.md'
```

### Verify Configuration
```bash
# Check if config files exist locally
ls -la backend/config/
ls -la sample-blog-page/src/config.js

# Verify they're not tracked by Git
git ls-files | grep -E "(config|\.env|\.json)"
```

## 📞 Security Contacts

If you discover any security issues:

1. **Do not create a public issue**
2. **Contact the project maintainer privately**
3. **Provide detailed information about the issue**
4. **Wait for acknowledgment before public disclosure**

## 📚 Additional Resources

- [Git Security Best Practices](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

**Remember**: Security is everyone's responsibility. Always think twice before committing any file that might contain sensitive information. 