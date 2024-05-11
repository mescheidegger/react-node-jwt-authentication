//services/accounts.js
const pool = require('../config/dbconfig');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const findUserByResetToken = async (token) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
    [token]
  );
  return result.rows[0];
};

const updateUserPassword = async (userId, newPassword) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await client.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, userId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const storeResetToken = async (email, resetToken, resetTokenExpires) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const normalizedEmail = email.trim().toLowerCase();
    await client.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE LOWER(email) = LOWER($3)',
      [resetToken, resetTokenExpires, normalizedEmail]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const checkEmailExists = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const emailExists = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = $1',
    [normalizedEmail]
  );
  return emailExists.rows.length > 0;
};

const checkUserExists = async (username, email) => {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await pool.query(
    'SELECT * FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $2',
    [normalizedUsername, normalizedEmail]
  );
  return userExists.rows.length > 0;
};

const getUserByUsername = async (username) => {
  const normalizedUsername = username.trim().toLowerCase();
  const result = await pool.query('SELECT * FROM users WHERE LOWER(username) = $1', [normalizedUsername]);
  return result.rows[0];
};

const getUsernameByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await pool.query(
    'SELECT username FROM users WHERE LOWER(email) = $1',
    [normalizedEmail]
  );
  return result.rows.length > 0 ? result.rows[0].username : null;
};

const getUserSettings = async (username) => {
  const normalizedUsername = username.trim().toLowerCase();
  const result = await pool.query('SELECT email, email_verified, email_subscribed FROM users WHERE LOWER(username) = $1', [normalizedUsername]);
  return result.rows[0];
};

const setUpdateSubscribed = async (username, isSubscribed) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const normalizedUsername = username.trim().toLowerCase();
    const result = await client.query(
      'UPDATE users SET email_subscribed = $1 WHERE LOWER(username) = LOWER($2) RETURNING *',
      [isSubscribed, normalizedUsername]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const setUpdatedEmail = async (username, newEmail) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const verificationToken = crypto.randomBytes(20).toString('hex'); // Generate a new verification token
    const result = await client.query(
      'UPDATE users SET email = $1, email_verified = false, verification_token = $2 WHERE LOWER(username) = LOWER($3) RETURNING *',
      [newEmail, verificationToken, username]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const setUpdatedPassword = async(username, newPassword) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const result = await client.query(
      'UPDATE users SET password = $1 WHERE LOWER(username) = LOWER($2) RETURNING *',
      [hashedPassword, username]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const setDeleteAccount = async (username) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'DELETE FROM users WHERE LOWER(username) = LOWER($1) RETURNING *',
      [username]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const registerUser = async (username, email, password, subscribe) => { 
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const result = await client.query(
      'INSERT INTO users (username, email, password, verification_token, email_subscribed) VALUES ($1, $2, $3, $4, $5) RETURNING *', // Add email_subscribed column
      [username, email, hashedPassword, verificationToken, subscribe] 
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const storeRefreshToken = async (userId, refreshToken, deviceInfo) => {
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check for an existing refresh token with the same user ID and device info
    const existingTokenResult = await client.query(
      'SELECT token_id FROM refresh_tokens WHERE user_id = $1 AND device_info = $2',
      [userId, deviceInfo]
    );

    // If an existing token is found, delete it
    if (existingTokenResult.rows.length > 0) {
      const existingTokenId = existingTokenResult.rows[0].token_id;
      await client.query(
        'DELETE FROM refresh_tokens WHERE token_id = $1',
        [existingTokenId]
      );
    }

    // Insert the new refresh token
    await client.query(
      'INSERT INTO refresh_tokens (user_id, refresh_token, device_info, expires_at) VALUES ($1, $2, $3, $4)',
      [userId, refreshToken, deviceInfo, expiresAt]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error storing refresh token:', error);
    throw error;
  } finally {
    client.release();
  }
};

const invalidateRefreshToken = async (username, deviceInfo) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get the user ID based on the username
    const normalizedUsername = username.trim().toLowerCase();
    const userResult = await client.query('SELECT id FROM users WHERE LOWER(username) = $1', [normalizedUsername]);
    const userId = userResult.rows[0].id;

    // Delete the refresh token(s) associated with the user ID and device info
    await client.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1 AND device_info = $2',
      [userId, deviceInfo]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getUserByRefreshToken = async (refreshToken) => {
  const client = await pool.connect();
  try {
    const refreshTokenResult = await client.query(
      'SELECT user_id FROM refresh_tokens WHERE refresh_token = $1',
      [refreshToken]
    );

    if (refreshTokenResult.rows.length === 0) {
      return null; // No refresh token found
    }

    const userId = refreshTokenResult.rows[0].user_id;
    const userResult = await client.query('SELECT * FROM users WHERE id = $1', [userId]);

    return userResult.rows[0]; // Return the user row
  } catch (error) {
    console.error('Error getting user by refresh token:', error);
    throw error;
  } finally {
    client.release();
  }
};

const verifyUserEmail = async (token) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'UPDATE users SET email_verified = true WHERE verification_token = $1 RETURNING *',
      [token]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
    checkUserExists,
    registerUser,
    getUserByUsername,
    storeRefreshToken,
    getUserByRefreshToken,
    invalidateRefreshToken,
    checkEmailExists,
    storeResetToken,
    updateUserPassword,
    findUserByResetToken,
    verifyUserEmail,
    getUsernameByEmail,
    getUserSettings,
    setUpdatedEmail,
    setUpdatedPassword,
    setUpdateSubscribed,
    setDeleteAccount
};
