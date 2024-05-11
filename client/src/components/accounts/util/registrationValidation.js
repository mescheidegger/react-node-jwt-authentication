// util/registrationValidation.js
export const validateForm = (formData) => {
  const errors = {};
  if (formData.username.length < 3 || formData.username.length > 16) {
    errors.username = 'Username must be between 3 and 16 characters long';
  }
  if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
    errors.email = 'Email is not valid';
  }
  if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\S]{8,16}$/)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  } else if (formData.password.length < 8 || formData.password.length > 16) {
    errors.password = 'Password must be between 8 and 16 characters long';
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
};
