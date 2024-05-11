//pages/Authpages.js
import React, { useState } from 'react';
import Login from '../../components/accounts/components/Login';
import AccountCreation from '../../components/accounts/components/AccountCreation';
import ForgotPassword from '../../components/accounts/components/ForgotPassword'; // Import the ForgotPassword component

function AuthPage() {
  const [activeForm, setActiveForm] = useState('login'); // State to track which form is active

  const toggleForm = (formName) => setActiveForm(formName); // Function to change the active form

  return (
    <div>
      {activeForm === 'login' && (
        <Login toggleForm={toggleForm} /> // Pass the toggleForm function directly
      )}
      {activeForm === 'signup' && (
        <AccountCreation toggleForm={() => toggleForm('login')} />
      )}
      {activeForm === 'forgotPassword' && (
        <ForgotPassword toggleForm={() => toggleForm('login')} />
      )}
    </div>
  );
}

export default AuthPage;
