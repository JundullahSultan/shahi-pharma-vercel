const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In routes/auth.js OR app.js
router.get('/', auth.redirectIfLoggedIn, (req, res) => {
  // If user is already logged in, maybe redirect them to dashboard?
  if (req.cookies.token) {
    // Optional: Check role and redirect accordingly
    return res.redirect('/admin/dashboard');
  }
  res.render('home');
});

router.get('/privacy', (req, res) => {
    res.render('privacy');
});

module.exports = router;
