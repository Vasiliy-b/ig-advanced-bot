// src/actions/likeSomePosts.js
import logger from '../utils/logger.js';
import { randomPause, randomNumber } from '../utils/randomUtils.js';
import { getPage } from '../browser.js';

async function likeSomePosts() {
  const page = getPage();
  if (!page) throw new Error('[likeSomePosts] No page found.');

  logger.info('[ACTION] Liking some posts...');
  try {
    // Ensure on home feed
    await page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' });
    await randomPause(2000, 5000);

    // Scroll feed a bit so we have some posts
    const scrollCount = randomNumber(1, 3);
    for (let i = 0; i < scrollCount; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await randomPause(3000, 6000);
    }

    // Attempt to find "Like" buttons
    // This selector often changes; inspect current DOM
    const likeButtons = await page.$$('article div button span[aria-label="Like"]');
    if (likeButtons.length === 0) {
      logger.info('No unliked posts found or DOM changed.');
      return;
    }

    const likeCount = randomNumber(1, Math.min(3, likeButtons.length));
    // Use a Set to avoid liking the same post twice if the selector returns duplicates
    const likedIndices = new Set();
    for (let i = 0; i < likeCount; i++) {
      let randomIndex;
      do {
        randomIndex = randomNumber(0, likeButtons.length - 1);
      } while (likedIndices.has(randomIndex));
      likedIndices.add(randomIndex);

      try {
        await likeButtons[randomIndex].click();
        logger.info(`Liked post #${randomIndex + 1}`);
        await randomPause(2000, 4000);
      } catch (clickErr) {
        logger.error(`[likeSomePosts] Error liking post #${randomIndex + 1}: ${clickErr.message}`);
      }
    }

  } catch (err) {
    logger.error(`[likeSomePosts] Error: ${err.message}`);
  }
}

export default likeSomePosts;