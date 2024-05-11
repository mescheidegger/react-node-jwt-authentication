// ForgotPassword.js
import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { forgotPwd } from '../../../api/api';
import ForgotForm from '../jsx/ForgotForm';

function ForgotPassword({ toggleForm }) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  const handleCaptchaChange = (value) => {
    setRecaptchaToken(value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setEmailError('');
    setIsLoading(true); // Start loading

    if (!validateEmail(email)) {
      setEmailError('Email is not valid');
      setIsLoading(false); // Stop loading if email is invalid
      return;
    }

    try {
      const data = await forgotPwd(email.toLowerCase().trim(), recaptchaToken);
      if (data.message === 'Password reset email sent') {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false); // Stop loading regardless of the outcome
    }
  };

  return (
    <Container style={{ minHeight: '100vh' }}>
      <Card className="mt-3">
        <Card.Body>
          <h2 className="text-center mb-4">Forgot Password</h2>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <ForgotForm
            email={email}
            setEmail={setEmail}
            emailError={emailError}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            isSubmitted={isSubmitted}
            handleCaptchaChange={handleCaptchaChange}
          />
          <div className="text-center mt-3">
            <Button variant="link" onClick={() => toggleForm('login')} className="p-0">Back to Login</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ForgotPassword;
