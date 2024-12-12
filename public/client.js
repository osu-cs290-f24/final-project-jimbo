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

  // Function to handle logout
  function handleLogout() {
    currentUser = null;
    localStorage.removeItem('token');
    document.querySelector('header').style.display = 'none'; // Hide header
    document.body.classList.remove('logged-in'); // Remove logged-in class from body
    renderLoginPage();
  }

  function renderHome() {
    clearElement(app);
    document.querySelector('header').style.display = 'block';
    const postsContainer = document.createElement('div');
    postsContainer.className = 'posts-container';
    app.appendChild(postsContainer);
  
    let page = 1;
    let isLoading = false;
    let hasMorePosts = true;
  
    function loadMorePosts() {
      if (isLoading || !hasMorePosts) return;
      isLoading = true;
  
      fetch(`/api/home?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => response.json())
      .then(data => {
        data.posts.forEach(post => {
          const postElement = createPostElement(post);
          postsContainer.appendChild(postElement);
        });
        hasMorePosts = data.hasMore;
        isLoading = false;
        page++;
      })
      .catch(error => {
        console.error('Error loading posts:', error);
        isLoading = false;
      });
    }
  
    loadMorePosts();
  
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMorePosts();
      }
    });
  }  
  
  function likePost(postId) {
    fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const likeButton = document.querySelector(`.like-button[data-id="${postId}"]`);
        likeButton.textContent = `Like (${data.likes})`;
        likeButton.classList.toggle('liked', data.liked);
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error liking post:', error));
  }  

  // Function to create a post element
  function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';

    // Create User Header
    const userHeader = document.createElement('div');
    userHeader.className = 'user-header';

    const userAvatar = document.createElement('img');
    userAvatar.src = post.userAvatar || 'default-profile.png';
    userAvatar.alt = `${post.userId}'s profile`;
    userAvatar.className = 'user-avatar';

    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    const userId = document.createElement('span');
    userId.className = 'user-id';
    userId.textContent = post.author;
    
    userInfo.appendChild(userId);
    userHeader.appendChild(userAvatar);
    userHeader.appendChild(userInfo);
    postElement.appendChild(userHeader);

    if (post.imageUrl) {
      const imageContainer = document.createElement('div');
      imageContainer.className = 'post-image-container';

      const image = document.createElement('img');
      image.src = post.imageUrl;
      image.alt = 'Post image';
      image.className = 'post-image';

      imageContainer.appendChild(image);
      postElement.appendChild(imageContainer);
    }

    const content = document.createElement('p');
    content.textContent = post.content;
    postElement.appendChild(content);

    const likeButton = document.createElement('button');
    likeButton.className = 'like-button';
    likeButton.textContent = `Like (${post.likes})`;
    likeButton.dataset.id = post.id;
    likeButton.addEventListener('click', () => likePost(post.id));
    postElement.appendChild(likeButton);

    const commentContainer = document.createElement('div');
    commentContainer.className = 'comment-container';

    const commentsDiv = document.createElement('div');
    commentsDiv.className = 'comments';
    post.comments.forEach(comment => {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'comment';
      const commentP = document.createElement('p');
      const commentAuthor = document.createElement('strong');
      commentAuthor.textContent = `${comment.author}: `;
      commentP.appendChild(commentAuthor);
      commentP.appendChild(document.createTextNode(comment.content));
      commentDiv.appendChild(commentP);
      commentsDiv.appendChild(commentDiv);
    });
    commentContainer.appendChild(commentsDiv);

    const commentForm = document.createElement('form');
    commentForm.className = 'comment-form';
    commentForm.dataset.id = post.id;

    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Add a comment';
    commentInput.required = true;
    commentForm.appendChild(commentInput);

    const commentButton = document.createElement('button');
    commentButton.type = 'submit';
    commentButton.textContent = 'Comment';
    commentForm.appendChild(commentButton);

    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addComment(post.id, commentInput.value);
      commentInput.value = '';
    });
    commentContainer.appendChild(commentForm);

    postElement.appendChild(commentContainer);

    return postElement;
  }  
    
  // Function to add a comment
  function addComment(postId, content) {
    fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ author: currentUser.username, content })
    })
    .then(response => response.json())
    .then(comment => {
      const commentsContainer = document.querySelector(`.post[data-id="${postId}"] .comments`);
      const commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `<p><strong>${comment.author}:</strong> ${comment.content}</p>`;
      commentsContainer.appendChild(commentElement);
    })
    .catch(error => console.error('Error adding comment:', error));
  }

  function renderCreatePost() {
    const createPostForm = document.createElement('form');
    createPostForm.className = 'create-post-form';

    const formTitle = document.createElement('h2');
    formTitle.textContent = 'Create New Post';
    createPostForm.appendChild(formTitle);

    const contentTextarea = document.createElement('textarea');
    contentTextarea.id = 'postContent';
    contentTextarea.placeholder = 'Enter post content';
    contentTextarea.required = true;

    const imageDropZone = document.createElement('div');
    imageDropZone.id = 'imageDropZone';
    imageDropZone.textContent = 'Drag and drop image here';
    imageDropZone.style.border = '2px dashed #ccc';
    imageDropZone.style.padding = '20px';
    imageDropZone.style.textAlign = 'center';

    const imagePreview = document.createElement('img');
    imagePreview.id = 'imagePreview';
    imagePreview.style.display = 'none';
    imagePreview.style.maxWidth = '100%';
    imagePreview.style.marginTop = '10px';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Create Post';
    submitButton.className = 'submit-button';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'cancel-button';
    cancelButton.addEventListener('click', () => {
        createPostForm.remove();
        renderHome();
    });

    buttonContainer.appendChild(submitButton);
    buttonContainer.appendChild(cancelButton);

    createPostForm.appendChild(contentTextarea);
    createPostForm.appendChild(imageDropZone);
    createPostForm.appendChild(imagePreview);
    createPostForm.appendChild(buttonContainer);

    let imageFile = null;

    imageDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageDropZone.style.backgroundColor = '#f0f0f0';
    });

    imageDropZone.addEventListener('dragleave', () => {
        imageDropZone.style.backgroundColor = '';
    });

    imageDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageDropZone.style.backgroundColor = '';
        imageFile = e.dataTransfer.files[0];
        if (imageFile && imageFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                imageDropZone.textContent = 'Image uploaded';
            };
            reader.readAsDataURL(imageFile);
        } else {
            alert('Please drop a valid image file.');
        }
    });

    createPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = document.getElementById('postContent').value;

        if (!imageFile) {
            alert('Please attach an image to create a post.');
            return;
        }

        createPost(content, imageFile);
    });

    const existingCreateMenu = document.querySelector('.create-menu');
    if (existingCreateMenu) existingCreateMenu.remove();

    app.appendChild(createPostForm);
}

  function createPost(content, imageFile) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', imageFile);

    fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(post => {
      alert('Post created successfully!');
      renderHome();
    })
    .catch(error => {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    });
  }

  // Add event listener for logo click
  document.getElementById('logo').addEventListener('click', () => {
    if (currentUser) {
      window.location.href = '/'; // This will trigger a page reload and the server will handle the routing
    } else {
      renderLoginPage();
    }
  });

  // Event listener for the profile button
  document.getElementById('profileButton').addEventListener('click', () => {
    if (currentUser) {
      // Remove existing menus
      const existingProfileMenu = document.querySelector('.profile-menu');
      const existingCreateMenu = document.querySelector('.create-menu');
      if (existingCreateMenu) existingCreateMenu.remove();

      // Toggle profile menu
      if (existingProfileMenu) {
        existingProfileMenu.remove();
      } else {
        // Create new profile menu
        const newProfileMenu = document.createElement('div');
        newProfileMenu.className = 'profile-menu';

        // Display username
        const usernameDisplay = document.createElement('p');
        usernameDisplay.textContent = currentUser.username;
        usernameDisplay.className = 'profile-username';
        newProfileMenu.appendChild(usernameDisplay);

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

        // Create menu items
        menuOptions.forEach(option => {
          const menuItem = document.createElement('button');
          menuItem.className = 'profile-menu-item';
          menuItem.textContent = option.text;
          menuItem.addEventListener('click', option.action);
          newProfileMenu.appendChild(menuItem);
        });

        // Append the new profile menu to the app
        app.appendChild(newProfileMenu);
      }
    } else {
      // If no user is logged in, render the login page
      renderLoginPage();
    }
  });

  // Event listener for the create button
  document.getElementById('createButton').addEventListener('click', () => {
    if (currentUser) {
      // Remove existing menus
      const existingProfileMenu = document.querySelector('.profile-menu');
      const existingCreateMenu = document.querySelector('.create-menu');
      if (existingProfileMenu) existingProfileMenu.remove();

      // Toggle create menu
      if (existingCreateMenu) {
        existingCreateMenu.remove();
      } else {
        // Create new create menu
        const newCreateMenu = document.createElement('div');
        newCreateMenu.className = 'create-menu';

        // Menu options
        const menuOptions = [
          { text: 'Create Post', action: () => renderCreatePost() },
          { text: 'Create Story', action: () => console.log('Create Story clicked') }
        ];

        // Create menu items
        menuOptions.forEach(option => {
          const menuItem = document.createElement('button');
          menuItem.className = 'create-menu-item';
          menuItem.textContent = option.text;
          menuItem.addEventListener('click', option.action);
          newCreateMenu.appendChild(menuItem);
        });

        // Append the new create menu to the app
        app.appendChild(newCreateMenu);
      }
    } else {
      // If no user is logged in, render the login page
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
