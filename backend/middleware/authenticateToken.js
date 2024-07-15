const jwt = require("jsonwebtoken");

module.exports = authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    const error = new Error("No access token");
    error.statusCode = 401;
    return next(error);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const error = new Error("Invalid access token");
      error.statusCode = 401;
      return next(error);
    }
    req.userId = payload.userId;
    next();
  });
};
