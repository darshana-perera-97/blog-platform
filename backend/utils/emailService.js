const nodemailer = require('nodemailer');
const { readConfigFile } = require('./fileUtils');

class EmailService {
  constructor() {
    this.transporter = null;
    this.config = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('📧 Initializing email service...');
      
      // Try to read the config file
      try {
        this.config = await readConfigFile('smtp-config.json');
        console.log('SMTP Config loaded successfully');
      } catch (configError) {
        console.error('Failed to load SMTP config:', configError.message);
        console.log('📧 Email verification will be disabled. Please configure SMTP settings.');
        this.initialized = false;
        return;
      }
      
      // Validate config structure
      if (!this.config || !this.config.smtp || !this.config.smtp.host || !this.config.smtp.auth || !this.config.smtp.auth.user || !this.config.smtp.auth.pass) {
        console.error('Invalid SMTP configuration structure - missing required fields');
        console.log('📧 Email verification will be disabled. Please configure SMTP settings.');
        this.initialized = false;
        return;
      }
      
      console.log('SMTP Config loaded:', {
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        user: this.config.smtp.auth.user,
        from: this.config.email?.from
      });
      
      this.transporter = nodemailer.createTransporter({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: {
          user: this.config.smtp.auth.user,
          pass: this.config.smtp.auth.pass
        },
        // Add timeout settings
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 60000      // 60 seconds
      });

      // Verify connection
      console.log('🔍 Verifying SMTP connection...');
      await this.transporter.verify();
      this.initialized = true;
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      
      if (error.code === 'EAUTH') {
        console.log('\n🔧 Authentication Error - Please check:');
        console.log('1. 2-Factor Authentication is enabled on Gmail');
        console.log('2. App password is correct (16 characters)');
        console.log('3. Gmail account allows SMTP access');
      } else if (error.code === 'ECONNECTION') {
        console.log('\n🔧 Connection Error - Please check:');
        console.log('1. Internet connection');
        console.log('2. SMTP host and port settings');
        console.log('3. Firewall/network restrictions');
      }
      
      console.log('📧 Email verification will be disabled. Please configure SMTP settings.');
      this.initialized = false;
    }
  }

  async sendVerificationEmail(email, token, username) {
    if (!this.initialized || !this.transporter) {
      console.log('📧 Email service not available, skipping verification email');
      return false;
    }

    try {
      const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
      
      const mailOptions = {
        from: `"${this.config.email.fromName}" <${this.config.email.from}>`,
        to: email,
        subject: 'Verify Your Email - Blog Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Blog Platform!</h2>
            <p>Hi ${username},</p>
            <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from Blog Platform. Please do not reply to this email.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Verification email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      return false;
    }
  }

  async sendWelcomeEmail(email, username) {
    if (!this.initialized || !this.transporter) {
      console.log('📧 Email service not available, skipping welcome email');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${this.config.email.fromName}" <${this.config.email.from}>`,
        to: email,
        subject: 'Welcome to Blog Platform!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Blog Platform!</h2>
            <p>Hi ${username},</p>
            <p>🎉 Your email has been verified successfully!</p>
            <p>You can now:</p>
            <ul>
              <li>Create and manage your blog posts</li>
              <li>Set up master prompts for AI-powered content</li>
              <li>Generate blog posts using AI</li>
              <li>Share your thoughts with the community</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000" 
                 style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Blogging Now
              </a>
            </div>
            <p>Happy blogging!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from Blog Platform. Please do not reply to this email.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Welcome email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      return false;
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

module.exports = new EmailService(); 