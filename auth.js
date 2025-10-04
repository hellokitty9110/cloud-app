const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

const optionalAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId, username: req.session.username };
  }
  next();
};

module.exports = { requireAuth, optionalAuth };