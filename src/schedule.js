// src/schedule.js
import cron from 'node-cron';
import logger from './utils/logger.js';
import { ACTIVE_HOURS_START, ACTIVE_HOURS_END, MIN_LOOP_INTERVAL, MAX_LOOP_INTERVAL } from './config.js';
import { randomNumber } from './utils/randomUtils.js';
import mainLoop from './mainLoop.js';

/**
 * Start a cron job that checks every minute whether we're in active hours,
 * then randomly decides if/when to do the next set of actions
 */
function startScheduler() {
  cron.schedule('* * * * *', () => {
    const hour = new Date().getHours();
    if (hour >= ACTIVE_HOURS_START && hour < ACTIVE_HOURS_END) {
      const runChance = Math.random();
      if (runChance > 0.5) {
        // 50% chance each minute
        const delayMins = randomNumber(MIN_LOOP_INTERVAL, MAX_LOOP_INTERVAL);
        logger.info(`[Scheduler] Will run action in ~${delayMins} minutes...`);
        setTimeout(() => {
          mainLoop();
        }, delayMins * 60 * 1000);
      }
    } else {
      logger.info('[Scheduler] Sleep hours, no action.');
    }
  });
}

export default startScheduler; // Export the function directly