import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const DeleteForm = ({
  modalError,
  setModalError,
  showDeleteModal,
  setShowDeleteModal,
  isLoading,
  handleDeleteAccount
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleDelete = () => {
    if (!username) {
      setModalError('');
      setError('Please enter your username to confirm deletion.');
      return;
    }
    setError('');
    handleDeleteAccount(username);
  };

  const handleShowModal = () => {
    setShowDeleteModal(true);
    setUsername('');
    setModalError('');
    setError('');
  };

  return (
    <>
      <Button variant="danger" onClick={handleShowModal}>
        Delete Account
      </Button>

      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setUsername(''); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>This will permanently delete your account and all data associated with it. This action cannot be reversed.</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Confirm Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            {modalError && <Alert variant="danger">{modalError}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteForm;
