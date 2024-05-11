// ./util/validation.js
export const validatePassword = (password) => {
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long';
  }
  if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\S]{8,16}$/)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  return '';
};

export const validateEmail = (email) => {
if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
  return 'Email is not valid';
}
return '';
}
