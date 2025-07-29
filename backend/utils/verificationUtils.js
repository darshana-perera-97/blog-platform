const crypto = require('crypto');
const { readJsonFile, writeJsonFile, generateId } = require('./fileUtils');

// Generate a secure verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create verification token record
const createVerificationToken = async (userId, email) => {
  const tokens = await readJsonFile('verification-tokens.json');
  
  const tokenRecord = {
    id: generateId(tokens),
    userId,
    email,
    token: generateVerificationToken(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    used: false
  };

  tokens.push(tokenRecord);
  await writeJsonFile('verification-tokens.json', tokens);
  
  return tokenRecord.token;
};

// Verify and consume verification token
const verifyToken = async (token) => {
  const tokens = await readJsonFile('verification-tokens.json');
  
  const tokenRecord = tokens.find(t => 
    t.token === token && 
    !t.used && 
    new Date(t.expiresAt) > new Date()
  );

  if (!tokenRecord) {
    return null;
  }

  // Mark token as used
  const tokenIndex = tokens.findIndex(t => t.id === tokenRecord.id);
  tokens[tokenIndex].used = true;
  await writeJsonFile('verification-tokens.json', tokens);

  return tokenRecord;
};

// Clean up expired tokens
const cleanupExpiredTokens = async () => {
  const tokens = await readJsonFile('verification-tokens.json');
  const now = new Date();
  
  const validTokens = tokens.filter(token => 
    new Date(token.expiresAt) > now || !token.used
  );

  if (validTokens.length !== tokens.length) {
    await writeJsonFile('verification-tokens.json', validTokens);
    console.log(`🧹 Cleaned up ${tokens.length - validTokens.length} expired verification tokens`);
  }
};

module.exports = {
  generateVerificationToken,
  createVerificationToken,
  verifyToken,
  cleanupExpiredTokens
}; 