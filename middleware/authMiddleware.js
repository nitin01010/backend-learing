const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Get header: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1]; // Extract token

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "❌ No token provided in Authorization header"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "❌ Invalid or expired token"
    });
  }
};

module.exports = verifyToken;
