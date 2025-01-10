// src/actions/checkMessages.js
import logger from '../utils/logger.js';
import { randomPause } from '../utils/randomUtils.js';
import { getPage } from '../browser.js';
import gptService from '../services/gptService.js';
const { generateReply } = gptService;
import { DAILY_DM_LIMIT } from '../config.js';

let dmCountToday = 0;

async function checkMessages() {
  const page = getPage();
  if (!page) throw new Error('[checkMessages] No Puppeteer page found.');

  try {
    logger.info('[ACTION] Checking DMs...');
    await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'networkidle2' });
    await randomPause(3000, 5000);

    // Example: detect unread convos
    // The selector changes often. Adjust as needed.
    const unreadSelector = '._aacl._aaco._aacw._aacx._aad6';
    const unreadConvos = await page.$$(unreadSelector);

    if (!unreadConvos.length) {
      logger.info('No unread conversations found.');
      return;
    }

    logger.info(`Found ~${unreadConvos.length} unread convos.`);

    for (const convo of unreadConvos) {
      try {
        await convo.click();
        await randomPause(2000, 4000);

        // Grab the other person's username from the convo header (varies in DOM)
        const userNameElement = await page.$('header div._ab8w div._ab8y');
        const userId = userNameElement
          ? await page.evaluate(el => el.innerText, userNameElement)
          : `unknownUser-${Date.now()}`;

        logger.info(`[checkMessages] Reading convo with user: ${userId}`);

        // Example: gather the last message text from bubble elements
        const bubbleSelector = 'div._aacl._aaco._aacu._aacx._aad6._aade';
        const messageTexts = await page.$$eval(bubbleSelector, els => els.map(e => e.innerText));
        if (!messageTexts.length) {
          logger.info('No messages found in conversation. Skipping...');
          await gotoInbox(page);
          continue;
        }

        // The last message from user
        const lastMessage = messageTexts[messageTexts.length - 1];

        // Generate GPT-based reply if we haven't hit daily limit
        if (dmCountToday < DAILY_DM_LIMIT) {
          const replyText = await generateReply(userId, lastMessage);

          // Type it in
          const chatBoxSelector = 'textarea';
          await page.waitForSelector(chatBoxSelector, { timeout: 5000 });
          await page.type(chatBoxSelector, replyText, { delay: 50 });
          await randomPause(1000, 2000);

          await page.keyboard.press('Enter');
          logger.info(`[checkMessages] Replied to ${userId} with: ${replyText}`);
          dmCountToday++;
        } else {
          logger.info(`Reached DM limit (${DAILY_DM_LIMIT}) for today.`);
        }

        await gotoInbox(page);
      } catch (innerErr) {
        logger.error(`[checkMessages] Error processing conversation: ${innerErr.message}`);
        // Optionally, try to close the current conversation and move to the next
        await gotoInbox(page);
      }
    }

  } catch (err) {
    logger.error(`[checkMessages] Error: ${err.message}`);
  }
}

async function gotoInbox(page) {
  await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: 'networkidle2' });
  await randomPause(2000, 3000);
}

export function resetDMCount() {
  dmCountToday = 0;
}

export default {
  checkMessages,
  resetDMCount
};