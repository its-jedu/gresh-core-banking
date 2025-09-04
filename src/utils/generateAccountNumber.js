module.exports = function generateAccountNumber() {
  // 10-digit random number
  return String(Math.floor(10_000_000_000 * Math.random())).slice(0, 10).padStart(10, '0');
};
