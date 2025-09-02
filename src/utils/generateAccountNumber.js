module.exports = function generateAccountNumber() {
  // 10-digit pseudo-random (you can swap for a sequence in DB later)
  return String(Math.floor(10_000_000_000 * Math.random())).slice(0, 10).padStart(10, '0');
};
