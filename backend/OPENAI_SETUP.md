# OpenAI API Setup Guide

This guide will help you configure OpenAI API for AI-powered blog generation in the Blog Platform.

## 🔑 Getting Your OpenAI API Key

1. **Visit OpenAI Platform**
   - Go to [https://platform.openai.com/](https://platform.openai.com/)
   - Sign up or log in to your account

2. **Create API Key**
   - Navigate to "API Keys" in the left sidebar
   - Click "Create new secret key"
   - Give it a name (e.g., "Blog Platform")
   - Copy the generated API key (starts with `sk-`)

3. **Add Credits**
   - Go to "Billing" in the left sidebar
   - Add payment method and credits to your account
   - GPT-3.5-turbo is very cost-effective (~$0.002 per 1K tokens)

## ⚙️ Configuration

1. **Update Configuration File**
   - Open `backend/config/openai-config.json`
   - Replace `"your-openai-api-key-here"` with your actual API key
   - Save the file

2. **Example Configuration:**
   ```json
   {
     "openai": {
       "apiKey": "sk-your-actual-api-key-here",
       "model": "gpt-3.5-turbo",
       "maxTokens": 500,
       "temperature": 0.7
     },
     "blogGeneration": {
       "defaultTitleLength": 60,
       "defaultContentLength": 300,
       "defaultMetaDescriptionLength": 160
     }
   }
   ```

## 🚀 Usage

1. **Start the Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Check AI Status**
   - Visit `http://localhost:3033/api/ai-blog/status`
   - Should show `"available": true` if configured correctly

3. **Generate Blog Posts**
   - Log in to the platform
   - Go to "🤖 AI Generator" in the navigation
   - Select a master prompt
   - Enter a topic
   - Choose writing style
   - Generate your blog post!

## 💰 Cost Optimization

**GPT-3.5-turbo Pricing (as of 2024):**
- Input tokens: $0.0015 per 1K tokens
- Output tokens: $0.002 per 1K tokens
- **Typical blog post cost: ~$0.01-0.02**

**Cost-Saving Tips:**
1. Use shorter master prompts
2. Set `maxTokens` to 300-500 for shorter posts
3. Use `temperature: 0.7` for balanced creativity
4. Monitor usage in OpenAI dashboard

## 🔧 Configuration Options

**Model Options:**
- `gpt-3.5-turbo` (Recommended - Fast & Cheap)
- `gpt-4` (Better quality, more expensive)
- `gpt-4-turbo` (Latest, best quality)

**Temperature Settings:**
- `0.0-0.3`: More focused, consistent
- `0.4-0.7`: Balanced creativity (Recommended)
- `0.8-1.0`: More creative, varied

**Token Limits:**
- `maxTokens: 300` - Short posts (~200 words)
- `maxTokens: 500` - Medium posts (~300 words)
- `maxTokens: 800` - Long posts (~500 words)

## 🛡️ Security Notes

1. **Never commit API keys to version control**
2. **Keep your API key private**
3. **Monitor usage regularly**
4. **Set up usage alerts in OpenAI dashboard**

## 🐛 Troubleshooting

**"AI service not available"**
- Check API key is correct
- Verify OpenAI account has credits
- Check internet connection

**"Rate limit exceeded"**
- Wait a few minutes
- Check OpenAI dashboard for limits
- Consider upgrading plan

**"Invalid API key"**
- Verify key starts with `sk-`
- Check for extra spaces or characters
- Generate new key if needed

## 📊 Monitoring Usage

1. **OpenAI Dashboard**
   - Visit [https://platform.openai.com/usage](https://platform.openai.com/usage)
   - Monitor daily/monthly usage
   - Set up usage alerts

2. **Server Logs**
   - Check console for API errors
   - Monitor token usage in logs

## 🎯 Best Practices

1. **Master Prompts**
   - Keep prompts concise but specific
   - Include tone and style guidelines
   - Test prompts before using

2. **Topics**
   - Be specific about what you want
   - Include target audience
   - Mention desired length

3. **Review Generated Content**
   - Always review before publishing
   - Edit for accuracy and tone
   - Add personal touches

## 🔄 Updates

- Check OpenAI documentation for latest models
- Monitor pricing changes
- Update configuration as needed

---

**Need Help?**
- Check OpenAI documentation: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- Review server logs for error messages
- Test with simple prompts first 