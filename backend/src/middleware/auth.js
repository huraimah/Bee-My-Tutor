const admin = require('../utils/firebase-admin');

module.exports = async function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  // Check if no token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify token
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user from payload
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};