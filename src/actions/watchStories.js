// src/actions/watchStories.js
import logger from '../utils/logger.js';
import { randomPause, randomNumber } from '../utils/randomUtils.js';
import { getPage } from '../browser.js';

async function watchStories() {
  const page = getPage();
  if (!page) throw new Error('[watchStories] No page found.');

  logger.info('[ACTION] Watching stories...');
  try {
    // Navigate to home feed
    await page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' });
    await randomPause(2000, 5000);

    // Example story ring selector
    const storyRingSelector = 'section div._aa62';
    const rings = await page.$$(storyRingSelector);

    if (rings.length > 0) {
      const watchCount = randomNumber(1, Math.min(2, rings.length));
      for (let i = 0; i < watchCount; i++) {
        await rings[i].click();
        logger.info(`Watching story ring ${i + 1}/${watchCount}`);
        await randomPause(4000, 8000); // watch
        await page.keyboard.press('Escape'); // close story
        await randomPause(2000, 3000);
      }
    } else {
      logger.info('No stories found or DOM changed.');
    }
  } catch (err) {
    logger.error(`[watchStories] Error: ${err.message}`);
  }
}

export default watchStories;