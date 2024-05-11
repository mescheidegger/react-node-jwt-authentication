// jsx/registrationForm.js
import React from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

const RegistrationForm = ({ formData, handleChange, validationErrors, handleSubmit, isLoading }) => {
  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            isInvalid={!!validationErrors.username}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.username}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!validationErrors.email}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.email}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!validationErrors.password}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.password}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            isInvalid={!!validationErrors.confirmPassword}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <br></br>
        <Form.Group controlId="formSubscribe">
          <Form.Check
            type="checkbox"
            label="I wish to subscribe to the newsletter to receive tips and news once a week. I know I can unsubscribe at any time."
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleChange}
          />
        </Form.Group>
        <br />
        <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="visually-hidden">Loading...</span>
            </>
          ) : (
            'Register'
          )}
        </Button>
      </Form>
    </>
  );
};

export default RegistrationForm;
