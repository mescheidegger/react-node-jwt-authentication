import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../providers/AuthContext';

const SignOutLink = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = async (event) => {
    event.preventDefault(); // Prevent the default link behavior
    await logout();
    navigate('/'); // Navigate to the home page after logging out
  };

  return (
    <a href="/" className="dropdown-item" onClick={handleSignOut}>Logout</a>
  );
};

export default SignOutLink;
