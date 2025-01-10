// src/browser.js
import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { USER_DATA_DIR /*, PROXY_SERVER*/ } from './config.js';

// Use stealth plugin
puppeteer.use(StealthPlugin());

let browser = null;
let page = null;

export async function initBrowser() { // Added export
  try {
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: USER_DATA_DIR,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // Uncomment to use proxy in future:
        // `--proxy-server=${PROXY_SERVER}`,
      ],
    });
    page = await browser.newPage();
    return { browser, page };
  } catch (err) {
    console.error('[Browser] Failed to launch browser:', err);
    throw err; // rethrow
  }
}

export async function closeBrowser() { // Added export
  if (browser) {
    await browser.close();
  }
}

export function getBrowser() { // Added export
  return browser;
}

export function getPage() { // Added export
  return page;
}

// No default export needed now
// Puppeteer launch + config