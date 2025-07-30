const fs = require('fs').promises;
const path = require('path');

class UsageTracker {
  constructor() {
    this.usageFile = path.join(__dirname, '..', 'data', 'usage.json');
    this.maxDailyBlogs = 4;
  }

  async ensureUsageFile() {
    try {
      await fs.access(this.usageFile);
    } catch (error) {
      // File doesn't exist, create it with empty data
      await fs.writeFile(this.usageFile, JSON.stringify({}, null, 2));
    }
  }

  getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  async getUserDailyUsage(userId) {
    await this.ensureUsageFile();
    
    try {
      const usageData = JSON.parse(await fs.readFile(this.usageFile, 'utf8'));
      const todayKey = this.getTodayKey();
      
      if (!usageData[userId]) {
        usageData[userId] = {};
      }
      
      if (!usageData[userId][todayKey]) {
        usageData[userId][todayKey] = {
          blogGenerations: 0,
          lastReset: new Date().toISOString()
        };
      }
      
      return usageData[userId][todayKey];
    } catch (error) {
      console.error('Error reading usage data:', error);
      return {
        blogGenerations: 0,
        lastReset: new Date().toISOString()
      };
    }
  }

  async incrementBlogGeneration(userId) {
    await this.ensureUsageFile();
    
    try {
      const usageData = JSON.parse(await fs.readFile(this.usageFile, 'utf8'));
      const todayKey = this.getTodayKey();
      
      if (!usageData[userId]) {
        usageData[userId] = {};
      }
      
      if (!usageData[userId][todayKey]) {
        usageData[userId][todayKey] = {
          blogGenerations: 0,
          lastReset: new Date().toISOString()
        };
      }
      
      usageData[userId][todayKey].blogGenerations += 1;
      usageData[userId][todayKey].lastReset = new Date().toISOString();
      
      await fs.writeFile(this.usageFile, JSON.stringify(usageData, null, 2));
      
      return usageData[userId][todayKey];
    } catch (error) {
      console.error('Error updating usage data:', error);
      throw new Error('Failed to update usage data');
    }
  }

  async canGenerateBlog(userId) {
    const usage = await this.getUserDailyUsage(userId);
    return usage.blogGenerations < this.maxDailyBlogs;
  }

  async getRemainingBlogs(userId) {
    const usage = await this.getUserDailyUsage(userId);
    const remaining = this.maxDailyBlogs - usage.blogGenerations;
    return Math.max(0, remaining);
  }

  async getUserUsageStats(userId) {
    const usage = await this.getUserDailyUsage(userId);
    return {
      used: usage.blogGenerations,
      remaining: this.maxDailyBlogs - usage.blogGenerations,
      max: this.maxDailyBlogs,
      lastReset: usage.lastReset
    };
  }

  // Clean up old usage data (older than 30 days)
  async cleanupOldData() {
    try {
      const usageData = JSON.parse(await fs.readFile(this.usageFile, 'utf8'));
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let cleaned = false;
      
      for (const userId in usageData) {
        for (const dateKey in usageData[userId]) {
          const dateParts = dateKey.split('-');
          const entryDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          
          if (entryDate < thirtyDaysAgo) {
            delete usageData[userId][dateKey];
            cleaned = true;
          }
        }
        
        // Remove user entry if no dates remain
        if (Object.keys(usageData[userId]).length === 0) {
          delete usageData[userId];
        }
      }
      
      if (cleaned) {
        await fs.writeFile(this.usageFile, JSON.stringify(usageData, null, 2));
        console.log('🧹 Cleaned up old usage data');
      }
    } catch (error) {
      console.error('Error cleaning up usage data:', error);
    }
  }
}

module.exports = new UsageTracker(); 