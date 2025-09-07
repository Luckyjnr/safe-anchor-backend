const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ msg: 'User not found' });

    // Check if user email is verified (for victim and expert)
    if ((user.userType === 'victim' || user.userType === 'expert') && !user.isVerified) {
      return res.status(403).json({ msg: 'Email not verified. Please verify your email to access this resource.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};
module.exports = authenticate; 