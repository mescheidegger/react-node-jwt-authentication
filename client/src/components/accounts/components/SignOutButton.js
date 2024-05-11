//components/SignOutButton.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../providers/AuthContext';

const SignOutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout(); // Wait for the logout function to complete
    navigate('/'); // Navigate to the home page
  };

  return (
    <button className="sign-out-button" onClick={handleSignOut}>
      Sign Out
    </button>
  );
};

export default SignOutButton;
