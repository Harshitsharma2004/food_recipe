const express = require('express');
const router = express.Router();

// GET current theme
router.get('/', (req, res) => {
  const theme = req.user.theme; // assuming user is authenticated
  res.json({ theme });
});

// PUT update theme
router.put('/', (req, res) => {
  const newTheme = req.body.theme;
  req.user.theme = newTheme;
  req.user.save();
  res.json({ success: true });
});

module.exports = router;
