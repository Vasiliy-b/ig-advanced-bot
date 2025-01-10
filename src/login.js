// src/login.js
import { randomPause, randomNumber } from './utils/randomUtils.js';
import { getPage } from './browser.js';
import logger from './utils/logger.js';

async function checkAndLogin(username, password) {
  const page = getPage();
  if (!page) throw new Error('No page found in login routine.');

  try {
    // Go to Instagram home
    await page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' });
    await randomPause(3000, 7000);

    // More Robust Check for Logged-Out State:
    // Wait for either the login button OR the username input field to be visible.
    // If neither is visible after a reasonable time, we can assume the user is logged in.
    try {
      await page.waitForSelector('button[type="submit"]', { timeout: 5000 }); // Wait for login button
      logger.info('Login button found. Not logged in. Attempting login...');
      await loginFlow(page, username, password);
    } catch (loginButtonTimeout) {
      try {
        await page.waitForSelector('input[name="username"]', { timeout: 5000 }); // Wait for username field
        logger.info('Username field found. Not logged in. Attempting login...');
        await loginFlow(page, username, password);
      } catch (usernameFieldTimeout) {
        logger.info('Neither login button nor username field quickly found. Assuming already logged in.');
      }
    }
  } catch (err) {
    logger.error(`[Login] Error checking or performing login: ${err.message}`);
    throw err;
  }
}

async function loginFlow(page, username, password) {
  // Navigate to login page
  await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
  await randomPause(2000, 4000);

  // Wait for the login form to be present
  await page.waitForSelector('#loginForm');

  // Fill in credentials
  await page.type('input[name="username"]', username, { delay: randomNumber(50, 150) });
  await page.type('input[name="password"]', password, { delay: randomNumber(50, 150) });

  // Click "Log in"
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  // Potential pop-ups
  // handle "Save Info?" or "Turn on Notifications?" if they appear
  // (selectors change over time, adjust as needed)

  logger.info('Login flow finished. If captcha or challenge, please solve it manually in the opened browser.');
}

export default checkAndLogin;