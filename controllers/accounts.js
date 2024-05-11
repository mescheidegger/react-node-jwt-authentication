//controllers/accounts.js
const { validationResult } = require('express-validator');
const accounts = require('../services/accounts');
const sendMail = require('../services/mailersend');
const subscribers = require('../services/mailerlite');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const DeviceDetector = require('device-detector-js');
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const idTokenSecret = process.env.ID_TOKEN_SECRET;
const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
const siteDomain = process.env.SITE_DOMAIN;
const expiry = 60 * 24 * 60 * 60 * 1000; // Expires in 60 days

const generateRefreshToken = (username) => {
    return jwt.sign({ username }, refreshTokenSecret, { expiresIn: '60d' });
};

const generateAccessToken = (username) => {
    return jwt.sign({ username }, accessTokenSecret, { expiresIn: '2h' });
}

const generateIDToken = (userDetails) => {
    return jwt.sign(userDetails, idTokenSecret, { expiresIn: '1h' });
};

const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

const getDeviceInfo = (req) => {
  const deviceDetector = new DeviceDetector();
  const ua = req.headers['user-agent'];
  return deviceDetector.parse(ua).device;
};

exports.resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { token, newPassword } = req.body;
  
    try {
      const user = await accounts.findUserByResetToken(token);
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      const passwordMatch = await bcrypt.compare(newPassword, user.password);
      if (passwordMatch) {
        return res.status(400).json({ message: 'Cannot use previous password' });
      }
  
      await accounts.updateUserPassword(user.id, newPassword);
  
      res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password' });
    }
};  

exports.forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { email, recaptchaToken } = req.body;
  
    try {
      // Verify reCAPTCHA response
      const recaptchaResponse = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        `secret=${recaptchaSecretKey}&response=${recaptchaToken}`
      );
  
      if (!recaptchaResponse.data.success) {
        return res.status(400).json({ message: 'CAPTCHA verification failed' });
      }
  
      // Get the username by email
      const username = await accounts.getUsernameByEmail(email);
      if (!username) {
        return res.status(404).json({ message: 'Email not found' });
      }
  
      // Generate a reset token
      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
  
      // Store the token in the database using the new service function
      await accounts.storeResetToken(email, resetToken, resetTokenExpires);
  
      // Send the reset email
      const resetUrl = `${siteDomain}/reset-password/${resetToken}`;
      await sendMail.sendForgotPasswordEmail(email, username, resetUrl);
  
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      res.status(500).json({ message: 'Error processing forgot password request' });
    }
}; 

exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username, email, password, subscribe } = req.body;
    try {
        if (await accounts.checkUserExists(username, email)) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const user = await accounts.registerUser(username, email, password, subscribe);
        const token = generateAccessToken(username);
        const refreshToken = generateRefreshToken(user.username);
        const deviceInfo = getDeviceInfo(req);

        // Store the refresh token with user ID and device information
        await accounts.storeRefreshToken(user.id, refreshToken, JSON.stringify(deviceInfo));

        const idToken = generateIDToken({
            isLoggedIn: true,
            username: user.username
        });

        res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expiry // Expires in 60 days
        });

        const verifyUrl = `${siteDomain}/verify-email/${user.verification_token}`;
        await sendMail.sendVerificationEmail(user.email, verifyUrl);
        if (subscribe) {
            subscribers.addSubscriber(user.email, user.username);
        }

        res.json({ message: 'Registration successful', idToken: idToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
};  

exports.verifyEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { token } = req.body;

    try {
        const user = await accounts.verifyUserEmail(token);
        if (user) {
            res.json({ message: 'Email verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};

exports.updateEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { newEmail, password } = req.body;

    try {
        const accessToken = req.cookies.jwt;
        if (!accessToken) {
            return res.status(401).json({ message: 'Access token not found' });
        }

        const decoded = jwt.verify(accessToken, accessTokenSecret);
        const username = decoded.username;

        const user = await accounts.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(403).json({ message: 'Incorrect password' }); // Use 403 instead of 401
        }

        if (await accounts.checkEmailExists(newEmail)) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const updatedUser = await accounts.setUpdatedEmail(username, newEmail);
        const verificationToken = updatedUser.verification_token; // Pull the new verification token from the updated user row

        const verifyUrl = `${siteDomain}/verify-email/${verificationToken}`;
        await sendMail.sendVerificationEmail(newEmail, verifyUrl);
        if (user.email_subscribed) {
            subscribers.addSubscriber(newEmail, user.username);
            subscribers.removeSubscriber(user.email);
        }

        res.json({ message: 'Email update successful. Please verify your new email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating email' });
    }
};

exports.updatePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { currentPassword, newPassword } = req.body;
    
    try {
        const accessToken = req.cookies.jwt;
        if (!accessToken) {
            return res.status(401).json({ message: 'Access token not found' });
        }

        const decoded = jwt.verify(accessToken, accessTokenSecret);
        const username = decoded.username;

        const user = await accounts.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(403).json({ message: 'Incorrect password' }); // Use 403 instead of 401
        }

        passwordMatch = await bcrypt.compare(newPassword, user.password);
        if (passwordMatch) {
            return res.status(400).json({ message: 'Cannot use previous password' });
        }

        await accounts.setUpdatedPassword(username, newPassword);

        res.json({ message: 'Password update successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating password' });
    }

};

exports.updateSubscribed = async (req, res) => {
    const { isSubscribed } = req.body;

    try {
        const accessToken = req.cookies.jwt;
        if (!accessToken) {
            return res.status(401).json({ message: 'Access token not found' });
        }

        const decoded = jwt.verify(accessToken, accessTokenSecret);
        const username = decoded.username;

        const user = await accounts.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await accounts.setUpdateSubscribed(username, isSubscribed);
        if (isSubscribed) {
            subscribers.addSubscriber(user.email, username);
        } else {
            subscribers.removeSubscriber(user.email);
        }

        res.json({ message: 'Subscription status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating subscription status' });
    }
};

exports.deleteAccount = async (req, res) => {
    const { username } = req.body;

    try {
        const accessToken = req.cookies.jwt;
        if (!accessToken) {
            return res.status(401).json({ message: 'Access token not found' });
        }

        const decoded = jwt.verify(accessToken, accessTokenSecret);
        const decodedUsername = decoded.username.toLowerCase();

        if (decodedUsername !== username.toLowerCase()) {
            return res.status(404).json({ message: 'Incorrect username' });
        }

        const user = await accounts.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'Incorrect username' });
        }

        await accounts.setDeleteAccount(username);

        res.clearCookie('jwt');
        res.clearCookie('refreshToken');

        if (user.email_subscribed) {
            subscribers.removeSubscriber(user.email);
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting account' });
    }
};

exports.getUserSettings = async (req, res) => {
    try {
        const accessToken = req.cookies.jwt;
        if (!accessToken) {
            return res.status(401).json({ message: 'Access token not found' });
        }

        const decoded = jwt.verify(accessToken, accessTokenSecret);
        const username = decoded.username;

        const user = await accounts.getUserSettings(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ email: user.email, emailVerified: user.email_verified, emailSubscribed: user.email_subscribed });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting user email' });
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await accounts.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Username or password incorrect' });
        }
  
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Username or password incorrect' });
        }
  
        const token = generateAccessToken(username);
        const refreshToken = generateRefreshToken(user.username);
        const deviceInfo = getDeviceInfo(req);
  
        // Store the refresh token with user ID and device information
        await accounts.storeRefreshToken(user.id, refreshToken, JSON.stringify(deviceInfo));

        const idToken = generateIDToken({
            isLoggedIn: true,
            username: user.username
        });
  
        res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: expiry // Expires in 60 days
        });
  
        res.json({ message: 'Login successful', idToken: idToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
};  

exports.logoutUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { username } = req.body; // Assuming the username is sent in the request body

    try {
        // Invalidate the refresh token in the database
        const deviceInfo = getDeviceInfo(req);
        await accounts.invalidateRefreshToken(username, deviceInfo);

        // Remove the cookies
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging out' });
    }
};

exports.verifyUser = async (req, res) => {
    let accessToken = req.cookies.jwt;
    let isLoggedIn = false;
    let username = null;
    let idToken = null;
    let message = 'Access Invalid';

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, accessTokenSecret);
            isLoggedIn = true;
            username = decoded.username; // Decode the username from the access token
            message = 'Access Valid';
            idToken = generateIDToken({
                isLoggedIn: true,
                username: username
            });
        } catch (error) {
            // Access token expired or invalid
        }
    }

    if (!isLoggedIn) {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, refreshTokenSecret);
                const user = await accounts.getUserByRefreshToken(refreshToken);
                const deviceInfo = getDeviceInfo(req);

                if (user && user.username === decoded.username) {
                    const newAccessToken = generateAccessToken(user.username);
                    const newRefreshToken = generateRefreshToken(user.username);
                    

                    // Store the new refresh token with user ID and device information
                    await accounts.storeRefreshToken(user.id, newRefreshToken, JSON.stringify(deviceInfo));

                    idToken = generateIDToken({
                        isLoggedIn: true,
                        username: user.username
                    });

                    res.cookie('jwt', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
                    res.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        maxAge: expiry // Expires in 60 days
                    });
                    message = 'Access Valid';
                } else {
                    // User is undefined or username does not match, possible token compromise
                    await accounts.invalidateRefreshToken(decoded.username, deviceInfo);
                    res.clearCookie('jwt');
                    res.clearCookie('refreshToken');
                    console.log('Possible account compromised: ' + decoded.username);
                }
            } catch (refreshError) {
                console.log(refreshError);
                return res.status(500).json({ message: 'Error verifying refresh token' });
            }
        }
    }

    res.json({ message, idToken });
};


exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
      const decoded = jwt.verify(refreshToken, refreshTokenSecret);
      const user = await accounts.getUserByRefreshToken(refreshToken);
      if (!user || user.username !== decoded.username) {
          return res.status(401).json({ message: 'Invalid refresh token' }); // User will need to log in again
      }

      const newAccessToken = generateAccessToken(user.username);
      res.cookie('jwt', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
      // Return the isLoggedIn state along with the new access token
      res.json({ isLoggedIn: true });
  } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
  }
};
