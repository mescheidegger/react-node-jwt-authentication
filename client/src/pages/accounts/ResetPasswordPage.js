import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { resetPassword } from '../../api/api';
import { validatePassword } from './util/validation';
import ResetForm from './jsx/ResetForm'; // Adjust the path as needed

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage(passwordError);
      setIsError(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setIsResetSuccessful(true);
      setMessage('Password has been reset successfully');
      setIsError(false);
    } catch (error) {
      if (error.message === 'Invalid or expired token') {
        setMessage('Invalid or expired token.');
        setIsError(true);
      } else if (error.message === 'Cannot use previous password') {
        setMessage('Cannot use previous password.');
        setIsError(true);
      } else {
        setMessage('Failed to reset password');
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container style={{ minHeight: '100vh' }}>
      <Card className="mt-3">
        <Card.Body>
          <h2 className="text-center mb-4">Reset Password</h2>
          {message && <Alert variant={isError ? 'danger' : 'success'}>{message}</Alert>}
          {!isResetSuccessful ? (
            <ResetForm
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
            />
          ) : (
            <div className="text-center mt-3">
              <Button variant="link" onClick={() => navigate('/login')} className="p-0">Back to Login</Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResetPasswordPage;
