// src/index.js
import 'dotenv/config';
import logger from './utils/logger.js';
import { initBrowser, closeBrowser } from './browser.js';
import checkAndLogin from './login.js';
import startScheduler from './schedule.js';
import resetDMCount from './actions/checkMessages.js';
import ConversationStore from './services/conversationStore.js'; // Import the class directly
import cron from 'node-cron';

const USERNAME = process.env.IG_USER;
const PASSWORD = process.env.IG_PASS;

(async function main() {
  try {
    // 1) Load conversation store
    new ConversationStore(); // Instantiate the class, loading happens in the constructor

    // 2) Initialize browser + page
    await initBrowser();

    // 3) Check login state, if needed log in
    if (!USERNAME || !PASSWORD) {
      throw new Error('Username/password not provided. Check .env or environment variables.');
    }
    await checkAndLogin(USERNAME, PASSWORD);

    // 4) Start the scheduling logic
    startScheduler();

    // 5) Reset DM count daily at midnight
    cron.schedule('0 0 * * *', () => {
      resetDMCount();
      logger.info('[CRON] Daily DM count reset.');
    });

    logger.info('Bot is up and running. Press Ctrl+C to stop.');

  } catch (err) {
    logger.error(`[Main] Fatal error: ${err.message}`);
    await closeBrowser();
    process.exit(1);
  }
})();