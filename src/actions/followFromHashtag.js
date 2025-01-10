// src/actions/followFromHashtag.js
import logger from '../utils/logger.js';
import { randomPause, randomNumber } from '../utils/randomUtils.js';
import { getPage } from '../browser.js';
import { HASHTAGS } from '../config.js';

async function followFromHashtag() {
  const page = getPage();
  if (!page) throw new Error('[followFromHashtag] No page found.');

  try {
    const hashtag = HASHTAGS[randomNumber(0, HASHTAGS.length - 1)];
    logger.info(`[ACTION] Following from hashtag #${hashtag}`);

    await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, { waitUntil: 'networkidle2' });
    await randomPause(3000, 6000);

    // Grab posts
    const postSelector = 'article a';
    const posts = await page.$$(postSelector);
    if (posts.length === 0) {
      logger.info('No posts found for this hashtag or DOM changed.');
      return;
    }

    const howMany = randomNumber(1, Math.min(2, posts.length));
    const usedIndices = new Set();
    for (let i = 0; i < howMany; i++) {
      let idx;
      do {
        idx = randomNumber(0, posts.length - 1);
      } while (usedIndices.has(idx));
      usedIndices.add(idx);

      try {
        await Promise.all([
          posts[idx].click(),
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);
        await randomPause(2000, 4000);

        // Click profile link from post modal
        const profileLink = await page.$('header div a');
        if (profileLink) {
          await Promise.all([
            profileLink.click(),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
          ]);
          await randomPause(2000, 4000);

          // Attempt to find "Follow" button
          const [followBtn] = await page.$x("//button[contains(text(),'Follow')]");
          if (followBtn) {
            await followBtn.click();
            logger.info(`Followed user from #${hashtag}`);
            await randomPause(2000, 3000);
          } else {
            logger.info('Already following or button not found.');
          }
        }
      } catch (navigationErr) {
        logger.error(`[followFromHashtag] Navigation error on post ${idx}: ${navigationErr.message}`);
      } finally {
        // Go back (ensure this doesn't break the loop if it fails)
        try {
          await page.goBack({ waitUntil: 'networkidle2' });
          await randomPause(2000, 4000);
          await page.goBack({ waitUntil: 'networkidle2' });
          await randomPause(2000, 3000);
        } catch (backErr) {
          logger.error(`[followFromHashtag] Error going back: ${backErr.message}`);
          // Consider a more robust way to navigate back to the hashtag page if this fails repeatedly
        }
      }
    }
  } catch (err) {
    logger.error(`[followFromHashtag] Error: ${err.message}`);
  }
}

export default followFromHashtag;