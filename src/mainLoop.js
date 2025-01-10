// src/mainLoop.js
import logger from './utils/logger.js';
import { randomNumber } from './utils/randomUtils.js';

// Existing actions
import scrollFeed from './actions/scrollFeed.js';
import watchStories from './actions/watchStories.js';
import likeSomePosts from './actions/likeSomePosts.js';
import followFromHashtag from './actions/followFromHashtag.js';
import checkMessages from './actions/checkMessages.js';

// New outreach action
import initiateOutreach from './actions/initiateOutreach.js';

async function mainLoop() {
  try {
    const actionChance = Math.random();

    if (actionChance < 0.2) {
      await scrollFeed();
    } else if (actionChance < 0.4) {
      await watchStories();
    } else if (actionChance < 0.55) {
      await likeSomePosts();
    } else if (actionChance < 0.7) {
      await followFromHashtag();
    } else if (actionChance < 0.85) {
      await checkMessages();
    } else {
      // final 15% chance
      // Optionally do an outreach
      const subChance = Math.random();
      if (subChance < 0.5) {
        await initiateOutreach();
      } else {
        logger.info('No action this loop (idle).');
      }
    }
  } catch (err) {
    logger.error(`[mainLoop] Error in action: ${err.message}`);
  }
}

export default mainLoop;