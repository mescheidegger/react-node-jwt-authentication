require('dotenv').config();
const jwt = require('jsonwebtoken');

// Secret key for JWT signing
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.jwt; // Read the token from the cookie
  const refreshToken = req.cookies.refreshToken;
  if (token) {
    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        console.log('Token could not be verified and a 401 was sent');
        return res.sendStatus(401);
      }
      req.user = user;
      next();
    });
  } else if (refreshToken) { //We are here if the access token doesn't exist in the cookies, but a refresh token does
    jwt.verify(refreshToken, refreshTokenSecret, (refreshErr) => {
        if (!refreshErr) {
            // Valid refresh token, send a 401 to indicate that a new access token is needed
            return res.sendStatus(401);
        } else {
            // Invalid refresh token, log them out
            res.sendStatus(403);
        }
    });
  } else { //This user is hitting a protected route and has no access or refresh token in their cookies   
    console.log('No Tokens Exist and a 403 was sent.')
    res.sendStatus(403);
  }
};


module.exports = authenticateJWT;
