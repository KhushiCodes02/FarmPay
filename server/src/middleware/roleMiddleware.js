const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Action requires one of these roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = { checkRole };
