// Login.js
import React, { useState, useContext } from 'react';
import { Alert, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../../api/api';
import { AuthContext } from '../../../providers/AuthContext';
import LoginForm from '../jsx/LoginForm';

function Login({ toggleForm }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const data = await loginUser(formData);
      if (data.message === 'Login successful') {
        login(data.idToken);
        navigate('/');
      } else {
        setErrorMessage('Username or password incorrect');
      }
    } catch (error) {
      if (error.message === 'Username or password incorrect') {
        setErrorMessage('Username or password incorrect')
      } else {
        setErrorMessage('An error occurred during login.');
      }
    }
  };

  return (
    <Container style={{ minHeight: '100vh' }}>
      <Card className="mt-3">
        <Card.Body>
          <h2 className="text-center mb-4">Login</h2>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <LoginForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            toggleForm={toggleForm}
          />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
