import React, { useState } from 'react';
import { Form, Button, Modal, Alert } from 'react-bootstrap';
import { validateEmail } from '../util/validation';

const EmailForm = ({
  email,
  setEmail,
  showModal,
  setShowModal,
  modalError,
  setModalError,
  isLoading,
  handleUpdateEmail
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');


  const handleShowModal = () => {
    setShowModal(true);
    setNewEmail('');
    setEmailError(''); 
    setEmailTouched(false);
  };

  const handleEmailChange = (e) => {
    const emailInput = e.target.value;
    setNewEmail(emailInput);
    if (emailTouched) { // Only validate if the field has been touched
      setEmailError(validateEmail(emailInput));
    }
  };

  const handleEmailBlur = () => { 
    setEmailTouched(true);
    setEmailError(validateEmail(newEmail));
  };

  const handleUpdate = () => {
    const validationError = validateEmail(newEmail); // Validate the email when the update button is clicked
    setEmailError(validationError);
    if (!validationError) {
      handleUpdateEmail(newEmail, password);
      setPassword('');
    }
  };

  return (
    <>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={true}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleShowModal}>
          Update Email
        </Button>
      </Form>

      <Modal show={showModal} onHide={() => { setShowModal(false); setModalError(''); setPassword(''); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="newEmail">
              <Form.Label>New Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter new email"
                value={newEmail}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur} // Add onBlur event handler
                isInvalid={!!emailError && emailTouched}
              />
              <Form.Control.Feedback type="invalid">
                {emailError}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            <Button variant="primary" onClick={handleUpdate} disabled={isLoading || !!emailError}>
              {isLoading ? 'Updating...' : 'Update Email'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EmailForm;
