import React from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

const ResetForm = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isLoading,
  handleSubmit
}) => {
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formNewPassword">
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group controlId="formConfirmPassword">
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </Form.Group>
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
  );
};

export default ResetForm;
