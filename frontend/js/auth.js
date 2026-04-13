// Authentication Handler - Manage user login, signup, and tokens

// Check if user is authenticated
const isAuthenticated = () => !!localStorage.getItem('authToken');

// Get current user data
const getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser') || '{}');

// Open authentication modal
const toggleAuth = () => {
  if (isAuthenticated()) {
    handleLogout();
  } else {
    document.getElementById('auth-modal').classList.add('show');
  }
};

// Close authentication modal
const closeAuthModal = () => {
  document.getElementById('auth-modal').classList.remove('show');
};

// Toggle between login and signup forms
const toggleAuthForm = () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
};

// Handle user signup
const handleSignup = async () => {
  try {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }

    const response = await authAPI.signup(name, email, password);
    alert('Account created successfully! Please login.');
    toggleAuthForm();

    // Clear signup form
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
  } catch (error) {
    alert('Signup failed: ' + error.message);
  }
};

// Handle user login
const handleLogin = async () => {
  try {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const response = await authAPI.login(email, password);
    handleAuthSuccess(response);
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
};

// Handle Successful Authentication
const handleAuthSuccess = (response) => {
  // Store token and user data
  localStorage.setItem('authToken', response.token);
  localStorage.setItem('currentUser', JSON.stringify(response.user));

  alert('Login successful!');
  closeAuthModal();

  // Clear login form
  if (document.getElementById('login-email')) document.getElementById('login-email').value = '';
  if (document.getElementById('login-password')) document.getElementById('login-password').value = '';
  if (document.getElementById('otp-email')) document.getElementById('otp-email').value = '';
  if (document.getElementById('login-otp')) document.getElementById('login-otp').value = '';

  // Update UI
  updateAuthUI();

  // Redirect if profile is incomplete
  if (!response.user.isProfileComplete) {
    window.location.href = 'profile.html';
  } else {
    location.reload();
  }
};

// Show OTP Login Form
const showOTPForm = () => {
  document.getElementById('password-login').style.display = 'none';
  document.getElementById('otp-login').style.display = 'block';
};

// Show Password Login Form
const showPasswordForm = () => {
  document.getElementById('password-login').style.display = 'block';
  document.getElementById('otp-login').style.display = 'none';
};

// Handle Sending OTP
const handleSendOTP = async () => {
  try {
    const email = document.getElementById('otp-email').value;
    if (!email) {
      alert('Please enter your email');
      return;
    }

    console.log("Attempting to send OTP to:", email);
    const response = await authAPI.sendOTP(email);
    alert(response.message || 'OTP sent successfully!');
    
    // Show OTP input field
    document.getElementById('otp-input-group').style.display = 'block';
    document.getElementById('sendOtpBtn').textContent = 'Resend OTP';
  } catch (error) {
    console.error("OTP Send error:", error);
    alert('Failed to send OTP: ' + error.message);
  }
};

// Handle Verifying OTP
const handleVerifyOTP = async () => {
  try {
    const email = document.getElementById('otp-email').value;
    const otp = document.getElementById('login-otp').value;

    if (!email || !otp) {
      alert('Please enter email and OTP');
      return;
    }

    console.log("Attempting to verify OTP:", { email, otp });
    const response = await authAPI.verifyOTP(email, otp);
    
    // For consistency with project structure, store token and user
    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("token", response.token); // Add "token" for requested fix compatibility
      handleAuthSuccess(response);
    } else {
      alert(response.message || "OTP verification failed");
    }
  } catch (error) {
    console.error("OTP Verification error:", error);
    alert('Verification failed: ' + error.message);
  }
};

// Handle user logout
const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('cart');
  alert('Logged out successfully!');
  updateAuthUI();
  location.reload();
};

// Update UI based on authentication status
const updateAuthUI = () => {
  const authLink = document.getElementById('auth-link');
  if (authLink) {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      authLink.textContent = `Logout (${user.name})`;
    } else {
      authLink.textContent = 'Login';
    }
  }
};

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById('auth-modal');
  if (event.target === modal) {
    modal.classList.remove('show');
  }
};
