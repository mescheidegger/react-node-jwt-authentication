//App.js
import React, { useContext } from 'react';
import './App.css';
import AuthPage from './pages/accounts/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/accounts/ProfilePage';
import SettingsPage from './pages/accounts/SettingsPage';
import ResetPasswordPage from './pages/accounts/ResetPasswordPage';
import VerifyEmailPage from './pages/accounts/VerifyEmailPage'
import Masthead from './components/Masthead';
import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthContext } from './providers/AuthContext'; // Import the AuthContext
import 'bootstrap/dist/css/bootstrap.min.css';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext); // Use isLoggedIn from AuthContext
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>; // Render a loading indicator or placeholder
  }

  return (
    
    <Router>
      <Masthead loggedIn={isLoggedIn} />
      <div className="content-container">   
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
