import React, { useState } from 'react';
import { Form, Button, Modal, Alert } from 'react-bootstrap';
import { validatePassword } from '../util/validation';

const PasswordForm = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPasswordModal,
  setShowPasswordModal,
  modalError,
  setModalError,
  isLoading,
  handleUpdatePassword
}) => {
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleUpdate = () => {
    if (newPassword !== confirmPassword) {
      setModalError('New and confirm password do not match.');
      return;
    }
    handleUpdatePassword(currentPassword, newPassword);
  };

  const handleShowModal = () => {
    setShowPasswordModal(true);
    setModalError('');
    setPasswordError('');
    setPasswordTouched(false);
  };

  const handlePasswordChange = (e) => {
    const passwordInput = e.target.value;
    setNewPassword(passwordInput);
    if (passwordTouched) { // Only validate if the field has been touched
      setPasswordError(validatePassword(passwordInput));
    }
  };

  const handlePasswordBlur = () => { 
    setPasswordTouched(true);
    setPasswordError(validatePassword(newPassword));
  };

  return (
    <>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="********"
            disabled={true}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleShowModal}>
            Update Password
          </Button>
      </Form>

      <Modal show={showPasswordModal} onHide={() => { setShowPasswordModal(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); } } centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                isInvalid={!!passwordError && passwordTouched}
              />
              <Form.Control.Feedback type="invalid">
                {passwordError}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            <br></br>
            <Button variant="primary" onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PasswordForm;
