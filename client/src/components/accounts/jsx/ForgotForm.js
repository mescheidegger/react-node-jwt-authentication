// ../jsx/ForgotForm.js
import React from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';

const ForgotForm = ({ email, setEmail, emailError, handleSubmit, isLoading, isSubmitted, handleCaptchaChange }) => {
  return (
    <>
      {!isSubmitted ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!emailError}
              required
            />
            <Form.Control.Feedback type="invalid">
              {emailError}
            </Form.Control.Feedback>
          </Form.Group>
          <br></br>
          <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            onChange={handleCaptchaChange}
          />
          <Button variant="primary" type="submit" className="w-100 mt-3" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="visually-hidden">Loading...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </Form>
      ) : (
        <Alert variant="success">A password reset email has been sent. Please check your inbox.</Alert>
      )}
    </>
  );
};

export default ForgotForm;
