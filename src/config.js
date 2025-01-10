// src/config.js

export const USER_DATA_DIR = './userData';

// Active hours for daily schedule (24-hour format)
export const ACTIVE_HOURS_START = 8;   // 8 AM
export const ACTIVE_HOURS_END = 22;    // 10 PM

// Interval range (in minutes) between action runs
export const MIN_LOOP_INTERVAL = 5;
export const MAX_LOOP_INTERVAL = 15;

// Random hashtags for following
export const HASHTAGS = ['nature', 'food', 'travel', 'tech'];

// Daily DM limit
export const DAILY_DM_LIMIT = 50;

// Path to store conversation JSON (for GPT context)
export const CONVO_STORE_PATH = './conversationStore.json';

// If you want to use a proxy in the future:
// export const PROXY_SERVER = 'http://username:password@ip:port'; // commented out by default
// Central config (active hours, paths, daily limits, etc.)