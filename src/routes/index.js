const router = require('express').Router();

router.get('/', (_req, res) => {
  res.json({ message: 'API is alive' });
});

module.exports = router;
