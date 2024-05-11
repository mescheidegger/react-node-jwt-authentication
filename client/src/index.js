import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './providers/AuthContext'; // Import the AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <AuthProvider>
      <App />
    </AuthProvider>
  
);

reportWebVitals();

/*  Invoking requests twice was breaking refresh token recycling
<React.StrictMode>
</React.StrictMode>
*/
