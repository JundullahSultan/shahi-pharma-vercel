const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;

  // 1. Handle Missing Token
  if (!token) return res.render('session-expired'); // Ensure this view exists!

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // 2. Handle Invalid Token
    if (err) return res.render('session-expired'); // Better than sendStatus(403) for UX

    // 3. Handle Role Mismatch
    if (decoded.role !== 'admin') {
      return res.render('admin-only-error');
    }

    req.user = decoded;

    // 4. FIX: Use 'const' and check if username exists
    if (decoded.username) {
      const adminName =
        decoded.username[0].toUpperCase() + decoded.username.slice(1);
      res.locals.adminName = adminName; // Passes variable to ALL views automatically
    } else {
      res.locals.adminName = 'Admin';
    }

    next();
  });
};

exports.verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.render('user/user-only-error');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    if (decoded.role !== 'user') {
      return res.render('user/user-only-error');
    }

    req.user = decoded;

    if (decoded.username) {
      const userName =
        decoded.username[0].toUpperCase() + decoded.username.slice(1);
      res.locals.userName = userName; // Passes variable to ALL views automatically
    } else {
      res.locals.userName = 'User';
    }
    next();
  });
};

// Sending HomePage

exports.redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.token;

  // 1. If no token, they are a guest. Let them pass to Home Page.
  if (!token) return next();

  // 2. Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token exists but is invalid/expired. Clear it and let them pass.
      res.clearCookie('token');
      return next();
    }

    // 3. User is logged in! Redirect based on role.
    if (decoded.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (decoded.role === 'user') {
      return res.redirect('/user/dashboard'); // Or /user/my-orders
    }

    // Fallback
    next();
  });
};
