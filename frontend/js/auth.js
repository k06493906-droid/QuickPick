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
  if (document.getElementById('email')) document.getElementById('email').value = '';
  if (document.getElementById('otp')) document.getElementById('otp').value = '';

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
    const email = document.getElementById('email').value;
    if (!email) {
      alert('Please enter your email');
      return;
    }

    console.log("Attempting to send OTP to:", email);
    const response = await authAPI.sendOTP(email, 'login');
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
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;

    if (!email || !otp) {
      alert('Please enter email and OTP');
      return;
    }

    console.log("Attempting to verify OTP:", { email, otp });
    const response = await authAPI.verifyOTP({ email, otp });
    
    // For consistency with project structure, store token and user
    if (response.token) {
      localStorage.setItem("token", response.token);
      handleAuthSuccess(response);
    } else {
      alert(response.message || "OTP verification failed");
    }
  } catch (error) {
    console.error("OTP Verification error:", error);
    alert('Verification failed: ' + error.message);
  }
};

// ==================== GOOGLE OTP FLOW ====================

// Show Google OTP form (hide other panels)
const showGoogleOTPForm = (mode) => {
  if (mode === 'login') {
    document.getElementById('password-login').style.display = 'none';
    document.getElementById('otp-login').style.display = 'none';
    document.getElementById('google-otp-login').style.display = 'block';
  } else {
    document.getElementById('signup-fields').style.display = 'none';
    document.getElementById('google-otp-signup').style.display = 'block';
  }
};

// Hide Google OTP form (show original panels)
const hideGoogleOTPForm = (mode) => {
  if (mode === 'login') {
    document.getElementById('google-otp-login').style.display = 'none';
    document.getElementById('password-login').style.display = 'block';
    // Reset google OTP state
    document.getElementById('google-otp-verify-login').style.display = 'none';
    document.getElementById('google-email-login').value = '';
    if (document.getElementById('google-otp-code-login')) document.getElementById('google-otp-code-login').value = '';
  } else {
    document.getElementById('google-otp-signup').style.display = 'none';
    document.getElementById('signup-fields').style.display = 'block';
    // Reset google OTP state
    document.getElementById('google-otp-verify-signup').style.display = 'none';
    document.getElementById('google-email-signup').value = '';
    if (document.getElementById('google-otp-code-signup')) document.getElementById('google-otp-code-signup').value = '';
  }
};

// Send OTP to Google email
const handleGoogleSendOTP = async (mode) => {
  try {
    const emailId = mode === 'login' ? 'google-email-login' : 'google-email-signup';
    const email = document.getElementById(emailId).value.trim();
    
    if (!email) {
      alert('Please enter your Gmail address');
      return;
    }

    // Validate it's a gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      alert('Please enter a valid Gmail address (ending with @gmail.com)');
      return;
    }

    const sendMode = mode === 'login' ? 'login' : 'signup';
    console.log("Sending Google OTP to:", email, "mode:", sendMode);
    const response = await authAPI.sendOTP(email, sendMode);
    alert(response.message || 'Verification code sent to your Gmail!');
    
    // Show OTP input field
    const verifyId = mode === 'login' ? 'google-otp-verify-login' : 'google-otp-verify-signup';
    document.getElementById(verifyId).style.display = 'block';
  } catch (error) {
    console.error("Google OTP send error:", error);
    alert('Failed to send code: ' + error.message);
  }
};

// Verify Google OTP and login/signup
const handleGoogleVerifyOTP = async (mode) => {
  try {
    const emailId = mode === 'login' ? 'google-email-login' : 'google-email-signup';
    const otpId = mode === 'login' ? 'google-otp-code-login' : 'google-otp-code-signup';
    const email = document.getElementById(emailId).value.trim();
    const otp = document.getElementById(otpId).value.trim();

    if (!email || !otp) {
      alert('Please enter your Gmail and verification code');
      return;
    }

    console.log("Verifying Google OTP:", { email, otp });
    const response = await authAPI.verifyOTP({ email, otp });
    
    if (response.token) {
      localStorage.setItem("token", response.token);
      handleAuthSuccess(response);
    } else {
      alert(response.message || "Verification failed");
    }
  } catch (error) {
    console.error("Google OTP verification error:", error);
    alert('Verification failed: ' + error.message);
  }
};

// ==================== END GOOGLE OTP ====================

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
  const profileWidget = document.getElementById('profile-widget');
  
  if (isAuthenticated()) {
    const user = getCurrentUser();
    
    // Update auth link
    if (authLink) {
      authLink.textContent = 'Logout';
      authLink.classList.remove('auth-btn');
      authLink.classList.add('auth-btn-logout');
    }
    
    // Show profile widget
    if (profileWidget) {
      profileWidget.style.display = 'flex';
      
      // Set avatar
      const avatarImg = document.getElementById('avatar-img');
      const avatarInitials = document.getElementById('avatar-initials');
      const dropdownAvatarImg = document.getElementById('dropdown-avatar-img');
      const dropdownAvatarInitials = document.getElementById('dropdown-avatar-initials');
      const dropdownName = document.getElementById('dropdown-user-name');
      const dropdownEmail = document.getElementById('dropdown-user-email');
      
      if (user.photo) {
        if (avatarImg) { avatarImg.src = user.photo; avatarImg.style.display = 'block'; }
        if (avatarInitials) avatarInitials.style.display = 'none';
        if (dropdownAvatarImg) { dropdownAvatarImg.src = user.photo; dropdownAvatarImg.style.display = 'block'; }
        if (dropdownAvatarInitials) dropdownAvatarInitials.style.display = 'none';
      } else {
        const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        if (avatarImg) avatarImg.style.display = 'none';
        if (avatarInitials) { avatarInitials.textContent = initials; avatarInitials.style.display = 'flex'; }
        if (dropdownAvatarImg) dropdownAvatarImg.style.display = 'none';
        if (dropdownAvatarInitials) { dropdownAvatarInitials.textContent = initials; dropdownAvatarInitials.style.display = 'flex'; }
      }
      
      if (dropdownName) dropdownName.textContent = user.name || 'User';
      if (dropdownEmail) dropdownEmail.textContent = user.email || '';
    }
  } else {
    if (authLink) {
      authLink.textContent = 'Login';
      authLink.classList.add('auth-btn');
      authLink.classList.remove('auth-btn-logout');
    }
    if (profileWidget) profileWidget.style.display = 'none';
  }
};

// Update UI on page load
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  
  // FIX 1: FRONTEND OTP BUTTON NOT WORKING - Add event listener
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", handleSendOTP);
  }

  // FIX 2: VERIFY OTP BUTTON - Add event listener for OTP verification
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", handleVerifyOTP);
  }
});

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById('auth-modal');
  if (event.target === modal) {
    modal.classList.remove('show');
  }
};
