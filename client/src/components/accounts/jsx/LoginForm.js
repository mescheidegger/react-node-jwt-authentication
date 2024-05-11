// ../jsx/LoginForm.js
import React from 'react';
import { Form, Button } from 'react-bootstrap';

const LoginForm = ({ formData, handleChange, handleSubmit, toggleForm }) => {
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
            required
          />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <br />
        <Button variant="primary" type="submit" className="w-100">
          Login
        </Button>
      </Form>
      <div className="text-center mt-3">
        <Button variant="link" onClick={() => toggleForm('signup')} className="p-0">Not Signed Up?</Button>
        <br />
        <Button variant="link" onClick={() => toggleForm('forgotPassword')} className="p-0">Forgot Password?</Button>
      </div>
    </>
  );
};

export default LoginForm;
