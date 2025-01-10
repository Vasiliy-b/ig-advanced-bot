// src/actions/scrollFeed.js
import logger from '../utils/logger.js';
import { randomPause, randomNumber } from '../utils/randomUtils.js';
import { getPage } from '../browser.js';

async function scrollFeed() {
  const page = getPage();
  if (!page) throw new Error('[scrollFeed] No page found.');

  logger.info('[ACTION] Scrolling feed...');
  // Ensure we're on home feed
  await page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' });
  await randomPause(2000, 5000);

  const scrollTimes = randomNumber(2, 5);
  for (let i = 0; i < scrollTimes; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await randomPause(3000, 6000);
  }
}

export default scrollFeed;