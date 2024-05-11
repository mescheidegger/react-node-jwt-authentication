//api/api.js
const fetchWithAuth = async (url, options) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      const data = await checkAuthStatus();
      if (data.message === 'Access Valid') {
        // Retry the original request with the refreshed token
        return fetchWithAuth(url, options);
      } else {
        throw new Error('Unauthorized');
      }
    } else if (response.status === 403) {
      throw new Error('Forbidden'); 
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (formData) => {
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
  
      return await response.json();
    } catch (error) {
      throw error;
    }
};
  
export const loginUser = async (formData) => {
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (username) => {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }), // Send the username in the request body
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const forgotPwd = async (email, recaptchaToken) => {
  try {
    const response = await fetch('/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, recaptchaToken }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return response.json();
  } catch (error) {
    console.error('Error in resetPassword API call:', error);
    throw error;
  }
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await fetch('/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }
  return response.json();
};

export const verifyEmail = async ({ token }) => {
  const response = await fetch('/verify-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error('Failed to verify e-mail');
  }
  return response.json();
};

export const checkAuthStatus = async () => { //investigate if I should be caching this
  try {
      const response = await fetch('/auth/check', { credentials: 'include', });
      return await response.json();
  } catch (error) {
      throw error;
  }
};

// Use the fetchWithAuth function for protected routes
export const getUserSettings = async () => {
  return fetchWithAuth('/get-settings', { method: 'GET' });
};

export const updateEmail = async (newEmail, password) => {
  return fetchWithAuth('/update-email', {
    method: 'POST',
    body: JSON.stringify({ newEmail, password }),
  });
};

export const updatePassword = async(currentPassword, newPassword) => {
  return fetchWithAuth('/update-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export const updateSubscribed = async(isSubscribed) => {
  return fetchWithAuth('/update-subscribed', {
    method: 'POST',
    body: JSON.stringify({ isSubscribed }),
  });
}

export const deleteAccount = async(username) => {
  return fetchWithAuth('/delete-account', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}
