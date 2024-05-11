// services/mailersend.js
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const forgotPasswordTemplate = process.env.FORGOT_PASSWORD_TEMPLATEID;
const verifyEmailTemplate = process.env.VERIFY_EMAIL_TEMPLATEID;
const senderDomain = process.env.SENDER_EMAIL_DOMAIN;
const senderName = process.env.SENDER_EMAIL_NAME;
const supportName = process.env.SENDER_EMAIL_SUPPORT;

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sendForgotPasswordEmail = async (recipientEmail, username, url) => {
  const sentFrom = new Sender(senderDomain, senderName);
  const recipients = [new Recipient(recipientEmail, 'User')];
  const personalization = [
    {
      email: recipientEmail,
      data: {
        link: url,
        username: username,
        support_email: supportName
      },
    }
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Password Reset Request')
    .setTemplateId(forgotPasswordTemplate)
    .setPersonalization(personalization);

  try {
    const response = await mailersend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

const sendVerificationEmail = async (recipientEmail, url) => {
  const sentFrom = new Sender(senderDomain, senderName);
  const recipients = [new Recipient(recipientEmail, 'User')];
  const personalization = [
    {
      email: recipientEmail,
      data: {
        link: url,
        name: 'Account Creation POC', //Name of org sending
        support_email: supportName
      },
    }
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Verify Your Email')
    .setTemplateId(verifyEmailTemplate)
    .setPersonalization(personalization);

  try {
    const response = await mailersend.email.send(emailParams);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

module.exports = { 
  sendForgotPasswordEmail,
  sendVerificationEmail 
};