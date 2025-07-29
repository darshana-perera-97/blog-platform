const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const configDir = path.join(__dirname, '../config');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Ensure config directory exists
const ensureConfigDir = async () => {
  try {
    await fs.access(configDir);
  } catch {
    await fs.mkdir(configDir, { recursive: true });
  }
};

// Read JSON file from data directory
const readJsonFile = async (filename) => {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
};

// Read JSON file from config directory
const readConfigFile = async (filename) => {
  await ensureConfigDir();
  const filePath = path.join(configDir, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
};

// Write JSON file
const writeJsonFile = async (filename, data) => {
  await ensureDataDir();
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Generate unique ID
const generateId = (items) => {
  if (items.length === 0) return 1;
  const maxId = Math.max(...items.map(item => item.id));
  return maxId + 1;
};

module.exports = {
  readJsonFile,
  readConfigFile,
  writeJsonFile,
  generateId
}; 