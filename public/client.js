document.addEventListener('DOMContentLoaded', () => {
  // Get the main application container
  const app = document.getElementById('app');
  // Variable to store the current user's information
  let currentUser = null;

  // Function to clear all child elements from a given element
  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  // Function to render the login page
  function renderLoginPage() {
    // Clear the main app container
    clearElement(app);
    // Create a container for authentication elements
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
  
    // Add logo
    const logo = document.createElement('div');
    logo.className = 'auth-logo';
    logo.textContent = 'JIWHAZA';
    authContainer.appendChild(logo);
  
    // Create login form
    const loginForm = document.createElement('form');
    loginForm.id = 'loginForm';
  
    // Create container for input fields
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
  
    // Create username input field
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Phone number, username, or email';
    usernameInput.required = true;
    inputContainer.appendChild(usernameInput);
  
    // Create password input field
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.required = true;
    inputContainer.appendChild(passwordInput);
  
    loginForm.appendChild(inputContainer);
  
    // Create login button
    const loginButton = document.createElement('button');
    loginButton.type = 'submit';
    loginButton.textContent = 'Log In';
    loginButton.className = 'login-button';
    loginForm.appendChild(loginButton);
  
    // Add divider
    const divider = document.createElement('div');
    divider.className = 'divider';
    const orSpan = document.createElement('span');
    orSpan.textContent = 'OR';
    divider.appendChild(orSpan);
    loginForm.appendChild(divider);
  
    // Add event listener for form submission
    loginForm.addEventListener('submit', handleLogin);
    authContainer.appendChild(loginForm);
  
    // Add registration link
    const registerContainer = document.createElement('div');
    registerContainer.className = 'register-container';
    registerContainer.innerHTML = `
      <p>Don't have an account? <a href="#" id="showRegister">Sign Up</a></p>
    `;
    authContainer.appendChild(registerContainer);
  
    // Add the auth container to the main app
    app.appendChild(authContainer);
  
    // Add event listener for the registration link
    document.getElementById('showRegister').addEventListener('click', renderRegisterPage);
  }    

  // Function to render the registration page
  function renderRegisterPage() {
    // Clear the main app container
    clearElement(app);
    // Create a container for authentication elements
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';

    // Add header for registration page
    const logo = document.createElement('div');
    logo.className = 'auth-logo';
    logo.textContent = 'JIWHAZA';
    authContainer.appendChild(logo);

    // Create registration form
    const registerForm = document.createElement('form');
    registerForm.id = 'registerForm';

    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    // Create new username input field
    const newUsernameInput = document.createElement('input');
    newUsernameInput.type = 'text';
    newUsernameInput.id = 'newUsername';
    newUsernameInput.placeholder = 'Username';
    newUsernameInput.required = true;
    inputContainer.appendChild(newUsernameInput);

    // Create new password input field
    const newPasswordInput = document.createElement('input');
    newPasswordInput.type = 'password';
    newPasswordInput.id = 'newPassword';
    newPasswordInput.placeholder = 'Password';
    newPasswordInput.required = true;
    inputContainer.appendChild(newPasswordInput);

    registerForm.appendChild(inputContainer);

    // Create sign up button
    const registerButton = document.createElement('button');
    registerButton.type = 'submit';
    registerButton.textContent = 'Sign Up';
    registerButton.className = 'login-button';
    registerForm.appendChild(registerButton);

    // Add event listener for form submission
    registerForm.addEventListener('submit', handleRegister);
    authContainer.appendChild(registerForm);

    // Add login link
    const loginLink = document.createElement('p');
    loginLink.textContent = 'Already have an account? ';
    const loginLinkA = document.createElement('a');
    loginLinkA.href = '#';
    loginLinkA.id = 'showLogin';
    loginLinkA.textContent = 'Log in';
    loginLink.appendChild(loginLinkA);
    authContainer.appendChild(loginLink);

    // Add the auth container to the main app
    app.appendChild(authContainer);

    // Add event listener for the login link
    document.getElementById('showLogin').addEventListener('click', renderLoginPage);
  }

  // Function to handle login form submission
  function handleLogin(e) {
    // Prevent reload
    e.preventDefault();
    // Take the information that the user put
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Send login request to the server
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Convert username and password to string
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {  // Check for token instead of response.ok
        currentUser = { username: data.username };
        localStorage.setItem('token', data.token);
        document.body.classList.add('logged-in'); // Add logged-in class to body
        renderHome();
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error:', error));
  }

  // Function to handle registration form submission
  function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    // Send registration request to the server
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      if (data.message === 'User registered successfully.') {
        renderLoginPage();
      }
    })
    .catch(error => console.error('Error:', error));
  }

  // Function to render the home page
  function renderHome() {
    clearElement(app);
    document.querySelector('header').style.display = 'block'; // Show header
  
    // Add more content for the home page here
  }

  // Function to handle logout
  function handleLogout() {
    currentUser = null;
    localStorage.removeItem('token');
    document.querySelector('header').style.display = 'none'; // Hide header
    document.body.classList.remove('logged-in'); // Remove logged-in class from body
    renderLoginPage();
  }    

  document.getElementById('profileButton').addEventListener('click', () => {
    if (currentUser) {
      // Remove existing profile menu if it exists
      const existingMenu = document.querySelector('.profile-menu');
      if (existingMenu) {
        existingMenu.remove();
      } else {
        // Create profile menu
        const profileMenu = document.createElement('div');
        profileMenu.className = 'profile-menu';
  
        // Display user name
        const usernameDisplay = document.createElement('p');
        usernameDisplay.textContent = currentUser.username;
        usernameDisplay.className = 'profile-username';
        profileMenu.appendChild(usernameDisplay);
  
        // Menu options
        const menuOptions = [
          { text: 'My Posts', action: () => console.log('My Posts clicked') },
          { text: 'Followers', action: () => console.log('Followers clicked') },
          { text: 'Following', action: () => console.log('Following clicked') },
          { text: 'Liked Posts', action: () => console.log('Liked Posts clicked') },
          { text: 'Saved Outfits', action: () => console.log('Saved Outfits clicked') },
          { text: 'Style Collections', action: () => console.log('Style Collections clicked') },
          { text: 'Fashion Events', action: () => console.log('Fashion Events clicked') },
          { text: 'Settings', action: () => console.log('Settings clicked') },
          { text: 'Logout', action: handleLogout }
        ];
  
        menuOptions.forEach(option => {
          const menuItem = document.createElement('button');
          menuItem.className = 'profile-menu-item';
          menuItem.textContent = option.text;
          menuItem.addEventListener('click', option.action);
          profileMenu.appendChild(menuItem);
        });
  
        app.appendChild(profileMenu);
      }
    } else {
      renderLoginPage();
    }
  });
  

  // Check if user is already logged in
  const token = localStorage.getItem('token');
  if (token) {
    // Verify token with the server
    fetch('/api/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        currentUser = { username: data.username };
        renderHome();
      } else {
        renderLoginPage();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      renderLoginPage();
    });
  } else {
    renderLoginPage();
  }
});
