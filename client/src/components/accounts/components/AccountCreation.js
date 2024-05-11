// AccountCreationForm.js
import React, { useState, useContext } from 'react';
import { Alert, Container, Card, Button } from 'react-bootstrap';
import { registerUser } from '../../../api/api';
import { AuthContext } from '../../../providers/AuthContext';
import { validateForm } from '../util/registrationValidation';
import RegistrationForm from '../jsx/RegistrationForm'; // Import the RegistrationForm component

function AccountCreation({ toggleForm }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscribe: true, 
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const [isRegistered, setIsRegistered] = useState(false); // State to track registration status
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setValidationErrors(errors);
    if (Object.keys(errors).length !== 0) {
      return;
    }
    setIsLoading(true); // Start loading
    try {
      const data = await registerUser(formData);
      if (data.message === 'Registration successful') {
        login(data.idToken);
        setIsRegistered(true); // Set registration status to true
      } else {
        setValidationErrors({ form: data.message });
      }
    } catch (error) {
      console.error(error);
      setValidationErrors({ form: error.message });
    } finally {
      setIsLoading(false); // Stop loading regardless of the outcome
    }
  };

  return (
    <Container style={{ minHeight: '100vh' }}>
      <Card className="mt-3">
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>
          {validationErrors.form && <Alert variant="danger">{validationErrors.form}</Alert>}
          {isRegistered ? (
            <Alert variant="success">Registration successful! Please check your email to verify your account.</Alert>
          ) : (
            <>
              <RegistrationForm
                formData={formData}
                handleChange={handleChange}
                validationErrors={validationErrors}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
              <div className="text-center mt-3">
                <Button variant="link" onClick={() => toggleForm('login')} className="p-0">
                  Already have an account?
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AccountCreation;
