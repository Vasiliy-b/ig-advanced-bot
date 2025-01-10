// src/actions/initiateOutreach.js
import logger from '../utils/logger.js';
import { randomPause, randomNumber } from '../utils/randomUtils.js';
import { getPage } from '../browser.js';
import gptService from '../services/gptService.js';
const { generateInitialMessage } = gptService;

/**
 * Suppose these are your own accounts that you'd like to contact.
 * In your case, these are ethically your own accounts.
 */
const account_list = [
  'ministryofspaceandtime',
  'katringodgiven',
  'sonyanevorobey'
];

async function initiateOutreach() {
  const page = getPage();
  if (!page) throw new Error('[initiateOutreach] No Puppeteer page found.');

  // Pick a random account from the list
  const idx = randomNumber(0, account_list.length - 1);
  const username = account_list[idx];

  logger.info(`[OUTREACH] Initiating conversation with ${username}...`);

  try {
    // 1) Navigate to that user's profile
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2'
    });
    await randomPause(2000, 4000);

    // 2) Click "Message" button (DOM selector might differ)
    const [messageBtn] = await page.$x("//button[contains(text(),'Message')]");
    if (!messageBtn) {
      logger.info(`No "Message" button found on ${username}'s profile (maybe private or DOM changed).`);
      return;
    }
    await messageBtn.click();
    await randomPause(2000, 4000);

    // 3) Generate the GPT-based initial message (silent prompt)
    const userId = username;
    const dmText = await generateInitialMessage(userId, username);

    // 4) Type it into the DM text area (adjust selector as needed)
    const chatBoxSelector = 'textarea';
    await page.waitForSelector(chatBoxSelector, { timeout: 5000 });
    await page.type(chatBoxSelector, dmText, { delay: 50 });
    await randomPause(1000, 2000);

    // 5) Press Enter to send
    await page.keyboard.press('Enter');
    logger.info(`[OUTREACH] Sent initial DM to ${username}: ${dmText}`);

  } catch (err) {
    logger.error(`[initiateOutreach] Error: ${err.message}`);
  }
}

export default initiateOutreach;