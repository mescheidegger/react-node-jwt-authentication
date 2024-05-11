import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import EmailForm from './jsx/EmailForm';
import PasswordForm from './jsx/PasswordForm';
import NewsLetterForm from './jsx/NewsLetterForm';
import DeleteForm from './jsx/DeleteForm';
import { getUserSettings, updateEmail, updatePassword, updateSubscribed, deleteAccount } from '../../api/api'; 
import { AuthContext } from '../../providers/AuthContext'; 

function SettingsPage() {
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSubScribed, setIsSubscribed] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserSettings = async () => {
      setIsSettingsLoading(true);
      try {
        const { email, emailVerified, emailSubscribed } = await getUserSettings();
        setEmail(email);
        setVerified(emailVerified);
        setIsSubscribed(emailSubscribed);
        setIsSettingsLoading(false);
      } catch (error) {
        setIsSettingsLoading(false);
        if (error.message === 'Unauthorized') {
            logout();
            navigate('/login');
        } else {
          console.error('Failed to fetch user settings:', error);
        }
      }
    };

    fetchUserSettings();
  }, [navigate, logout]);

  const handleUpdateEmail = async (newEmail, password) => { 
    setIsLoading(true);
    setModalError(''); 
    try {
      await updateEmail(newEmail, password); 
      setMessageWithTimeout('A verification has been sent to your new e-mail address.');
      setIsError(false);
      setShowModal(false);
      setEmail(newEmail);
    } catch (error) {
      if (error.message === 'Email already in use') {
        setModalError('This email is already in use.');
      } else if (error.message === 'Forbidden') {
        setModalError('Incorrect password.');
      } else {
        setMessageWithTimeout('Failed to update email');
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      await updatePassword(currentPassword, newPassword); 
      setMessageWithTimeout('Password updated successfully.');
      setIsError(false);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.message === 'Forbidden') {
        setModalError('Incorrect password.');
      } else if (error.message === 'Cannot use previous password') {
        setModalError('Cannot use previous password.');
      } else {
        setMessageWithTimeout('Failed to update password');
        setIsError(true);
      }     
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionChange = async (isSubscribed) => {
    setIsLoading(true);
    try {
      await updateSubscribed(isSubscribed);
      setIsSubscribed(isSubscribed);
      setMessageWithTimeout('Subscription status updated successfully.');
      setIsError(false);
    } catch (error) {
      setMessageWithTimeout('Failed to update subscription status');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (username) => {
    setIsLoading(true);
    try {
      await deleteAccount(username);
      setShowDeleteModal(false);
      await logout();
      navigate('/');
    } catch (error) {
      if (error.message === 'Incorrect username') {
        setModalError('Incorrect username entered.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const setMessageWithTimeout = (msg) => {
    setMessage(msg);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000); // Hide the alert after 3 seconds
  };  

  return (
    <Container style={{ minHeight: '100vh' }}>
      <Card className="mt-3">
        <Card.Body>
          <h2 className="text-center mb-4">Account Settings</h2>
          {!verified && !isSettingsLoading && (
            <Alert variant="warning">
              Your email is not verified. Please check your inbox (or possibly spam folder) for a verification email.
            </Alert>
          )}
          {showAlert && message && <Alert variant={isError ? 'danger' : 'success'}>{message}</Alert>}
          {isSettingsLoading ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : (
            <>
              <h3>Login Details</h3>
              <EmailForm
                email={email}
                setEmail={setEmail}
                showModal={showModal}
                setShowModal={setShowModal}
                modalError={modalError}
                setModalError={setModalError}
                isLoading={isLoading}
                handleUpdateEmail={handleUpdateEmail}
              />
              <br></br>
              <PasswordForm
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPasswordModal={showPasswordModal}
                setShowPasswordModal={setShowPasswordModal}
                modalError={modalError}
                setModalError={setModalError}
                isLoading={isLoading}
                handleUpdatePassword={handleUpdatePassword}
              />
              <br></br>
              <hr></hr>
              <br></br>
              <h3>Newsletter</h3>
              <NewsLetterForm 
                isSubscribed={isSubScribed}
                setIsSubscribed={handleSubscriptionChange}  
              />
              <br></br>
              <hr></hr>
              <br></br>
              <h3>Danger Zone</h3>
              <DeleteForm
                modalError={modalError}
                setModalError={setModalError}
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                isLoading={isLoading}
                handleDeleteAccount={handleDeleteAccount}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SettingsPage;
