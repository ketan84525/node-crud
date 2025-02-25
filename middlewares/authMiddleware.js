const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Token verification error:", err.message);
            return res.status(403).json({ message: "Invalid Token" });
        }
        req.user = decoded; // Store user data in request
        next();
    });
};

module.exports = verifyToken ;
