export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomPause(minMs, maxMs) {
  const ms = randomNumber(minMs, maxMs);
  return new Promise(res => setTimeout(res, ms));
}