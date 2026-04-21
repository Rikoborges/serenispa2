const adminMiddleware = (req, res, next) => {
  if (!req.auth || req.auth.isAdmin !== true) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  }
  next();
};

module.exports = adminMiddleware;