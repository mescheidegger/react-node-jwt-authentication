import React, { createContext, useState, useEffect } from 'react';
import { checkAuthStatus, logoutUser } from '../api/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const data = await checkAuthStatus();
        if (data.message === 'Access Valid') {
          if (data.idToken !== null) { //Access was refreshed
            const userData = jwtDecode(data.idToken);
            setIsLoggedIn(userData.isLoggedIn);
            setUsername(userData.username);
          }
        } else {
          //Access not valid
          setIsLoggedIn(false);
          setUsername('');
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (idToken) => {
    const userData = jwtDecode(idToken);
    setIsLoggedIn(userData.isLoggedIn);
    setUsername(userData.username);
  };

  const logout = async () => {
    try {
      await logoutUser(username); // Pass the username to the logoutUser API function
      setIsLoggedIn(false);
      setUsername('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
