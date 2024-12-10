document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    let currentUser = null;
  
    function clearElement(element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  
    function renderLoginPage() {
      clearElement(app);
      const authContainer = document.createElement('div');
      authContainer.className = 'auth-container';
    
      // 로고 추가
      const logo = document.createElement('div');
      logo.className = 'auth-logo';
      logo.textContent = 'JIWHAZA';
      authContainer.appendChild(logo);
    
      // 로그인 폼
      const loginForm = document.createElement('form');
      loginForm.id = 'loginForm';
    
      // 입력 필드 컨테이너
      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container';
    
      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.id = 'username';
      usernameInput.placeholder = '전화번호, 사용자 이름 또는 이메일';
      usernameInput.required = true;
      inputContainer.appendChild(usernameInput);
    
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.id = 'password';
      passwordInput.placeholder = '비밀번호';
      passwordInput.required = true;
      inputContainer.appendChild(passwordInput);
    
      loginForm.appendChild(inputContainer);
    
      // 로그인 버튼
      const loginButton = document.createElement('button');
      loginButton.type = 'submit';
      loginButton.textContent = '로그인';
      loginButton.className = 'login-button';
      loginForm.appendChild(loginButton);
    
      // 구분선
      const divider = document.createElement('div');
      divider.className = 'divider';
      divider.innerHTML = '<span>또는</span>';
      loginForm.appendChild(divider);
    
      loginForm.addEventListener('submit', handleLogin);
      authContainer.appendChild(loginForm);
    
      // 회원가입 링크
      const registerContainer = document.createElement('div');
      registerContainer.className = 'register-container';
      registerContainer.innerHTML = `
        <p>계정이 없으신가요? <a href="#" id="showRegister">가입하기</a></p>
      `;
      authContainer.appendChild(registerContainer);
    
      app.appendChild(authContainer);
    
      document.getElementById('showRegister').addEventListener('click', renderRegisterPage);
    }    
  
    function renderRegisterPage() {
      clearElement(app);
      const authContainer = document.createElement('div');
      authContainer.className = 'auth-container';
  
      const registerHeader = document.createElement('h2');
      registerHeader.textContent = 'Create an Account';
      authContainer.appendChild(registerHeader);
  
      const registerForm = document.createElement('form');
      registerForm.id = 'registerForm';
  
      const newUsernameInput = document.createElement('input');
      newUsernameInput.type = 'text';
      newUsernameInput.id = 'newUsername';
      newUsernameInput.placeholder = 'Username';
      newUsernameInput.required = true;
      registerForm.appendChild(newUsernameInput);
  
      const newPasswordInput = document.createElement('input');
      newPasswordInput.type = 'password';
      newPasswordInput.id = 'newPassword';
      newPasswordInput.placeholder = 'Password';
      newPasswordInput.required = true;
      registerForm.appendChild(newPasswordInput);
  
      const registerButton = document.createElement('button');
      registerButton.type = 'submit';
      registerButton.textContent = 'Sign Up';
      registerForm.appendChild(registerButton);
  
      registerForm.addEventListener('submit', handleRegister);
      authContainer.appendChild(registerForm);
  
      const loginLink = document.createElement('p');
      loginLink.textContent = 'Already have an account? ';
      const loginLinkA = document.createElement('a');
      loginLinkA.href = '#';
      loginLinkA.id = 'showLogin';
      loginLinkA.textContent = 'Log in';
      loginLink.appendChild(loginLinkA);
      authContainer.appendChild(loginLink);
  
      app.appendChild(authContainer);
  
      document.getElementById('showLogin').addEventListener('click', renderLoginPage);
    }

    function handleLogin(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
    
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {  // response.ok 대신 data.token 확인
          currentUser = { username: data.username };
          localStorage.setItem('token', data.token);
          document.body.classList.add('logged-in'); // 로그인 상태 표시
          renderHome();
        } else {
          alert(data.message);
        }
      })
      .catch(error => console.error('Error:', error));
    }
  
    function handleRegister(e) {
      e.preventDefault();
      const username = document.getElementById('newUsername').value;
      const password = document.getElementById('newPassword').value;
  
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
  
    function renderHome() {
      clearElement(app);
      document.querySelector('header').style.display = 'block'; // 헤더 표시
      
      const welcomeHeader = document.createElement('h2');
      welcomeHeader.textContent = `Welcome, ${currentUser.username}!`;
      app.appendChild(welcomeHeader);
      // Add more content for the home page here
    }
  
    function handleLogout() {
      currentUser = null;
      localStorage.removeItem('token');
      document.querySelector('header').style.display = 'none'; // 헤더 숨기기
      document.body.classList.remove('logged-in'); // 로그인 상태 제거
      renderLoginPage();
    }    
  
    // Update profile button to show logout option
    document.getElementById('profileButton').addEventListener('click', () => {
      if (currentUser) {
        const profileMenu = document.createElement('div');
        profileMenu.className = 'profile-menu';
  
        const usernameDisplay = document.createElement('p');
        usernameDisplay.textContent = currentUser.username;
        profileMenu.appendChild(usernameDisplay);
  
        const logoutButton = document.createElement('button');
        logoutButton.id = 'logoutButton';
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', handleLogout);
        profileMenu.appendChild(logoutButton);
  
        app.appendChild(profileMenu);
      } else {
        renderLoginPage();
      }
    });
  
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
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
  