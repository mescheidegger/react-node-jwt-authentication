// routes/routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const accountsController = require('../controllers/accounts');
const rateLimit = require('../middleware/rateLimit');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/register', rateLimit, [
    body('username').isLength({ min: 3, max: 16 }).withMessage('Username must be between 3 and 16 characters long').trim().escape(),
    body('email').isEmail().withMessage('Email is not valid').normalizeEmail({
        all_lowercase: true, // Convert the entire email address to lowercase
        gmail_lowercase: true, // Convert Gmail addresses to lowercase
        gmail_remove_dots: true, // Remove dots in the local part of Gmail addresses
        gmail_remove_subaddress: true, // Remove tags in the local part of Gmail addresses
        outlookdotcom_lowercase: true, // Convert Outlook.com addresses to lowercase
        yahoo_lowercase: true, // Convert Yahoo Mail addresses to lowercase
        icloud_lowercase: true, // Convert iCloud addresses to lowercase
    }),
    body('password').isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
                  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/)
                  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
], accountsController.registerUser);

router.post('/login', rateLimit, accountsController.loginUser);

router.get('/auth/check', rateLimit, accountsController.verifyUser);

router.post('/refresh-token', rateLimit, accountsController.refreshToken);

router.post('/logout', rateLimit, [
    body('username').trim().escape(),
], accountsController.logoutUser);

router.post('/forgot-password', rateLimit, [
    body('email').isEmail().withMessage('Email is not valid').normalizeEmail({
        all_lowercase: true, // Convert the entire email address to lowercase
        gmail_lowercase: true, // Convert Gmail addresses to lowercase
        gmail_remove_dots: true, // Remove dots in the local part of Gmail addresses
        gmail_remove_subaddress: true, // Remove tags in the local part of Gmail addresses
        outlookdotcom_lowercase: true, // Convert Outlook.com addresses to lowercase
        yahoo_lowercase: true, // Convert Yahoo Mail addresses to lowercase
        icloud_lowercase: true, // Convert iCloud addresses to lowercase
    }),
], accountsController.forgotPassword);

router.post('/reset-password', [
    body('token').trim().escape(),
    body('newPassword').isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
                  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/)
                  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
], accountsController.resetPassword);

router.post('/verify-email', [
    body('token').trim().escape(),
], accountsController.verifyEmail);

router.get('/get-settings', authenticateJWT, accountsController.getUserSettings);

router.post('/update-email', authenticateJWT, [
    body('newEmail').isEmail().withMessage('Email is not valid').normalizeEmail({
        all_lowercase: true, // Convert the entire email address to lowercase
        gmail_lowercase: true, // Convert Gmail addresses to lowercase
        gmail_remove_dots: true, // Remove dots in the local part of Gmail addresses
        gmail_remove_subaddress: true, // Remove tags in the local part of Gmail addresses
        outlookdotcom_lowercase: true, // Convert Outlook.com addresses to lowercase
        yahoo_lowercase: true, // Convert Yahoo Mail addresses to lowercase
        icloud_lowercase: true, // Convert iCloud addresses to lowercase
    }),
], accountsController.updateEmail);

router.post('/update-password', authenticateJWT, [
    body('newPassword').isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters long')
                  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,16}$/)
                  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
], accountsController.updatePassword);

router.post('/update-subscribed', authenticateJWT, accountsController.updateSubscribed);

router.post('/delete-account', authenticateJWT, accountsController.deleteAccount);

module.exports = router;

/*
NOTE:
The authenticateJWT middleware can be used to protect sensitive routes. It will return a 403 to the client side.
The client side could call the refresh-token endpoint after catching the 403 to keep the session alive and issue a new token.
*/
