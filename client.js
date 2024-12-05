document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    let currentUser = null;
    let cart = [];

    function renderHome() {
        const postsContainer = document.createElement('div');
        postsContainer.id = 'posts';
        const newPostBtn = document.createElement('button');
        newPostBtn.id = 'newPostBtn';
        newPostBtn.textContent = 'Create New Post';
        const header = document.createElement('h2');
        header.textContent = 'Fashion Feed';

        app.innerHTML = '';
        app.append(header, postsContainer, newPostBtn);
        
        if (currentUser) {
            newPostBtn.addEventListener('click', () => {
                const newPostForm = document.createElement('form');
                newPostForm.innerHTML = `
                    <input type="text" id="postTitle" placeholder="Title" required>
                    <textarea id="postContent" placeholder="Content" required></textarea>
                    <button type="submit">Post</button>
                `;
                newPostForm.addEventListener('submit', handleNewPost);
                app.appendChild(newPostForm);
            });
        }

        fetchPosts();
    }

    async function fetchPosts() {
        try {
            const response = await fetch('/api/posts');
            const posts = await response.json();

            const postsContainer = document.getElementById('posts');
            postsContainer.innerHTML = '';

            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.classList.add('post');

                const postTitle = document.createElement('h3');
                postTitle.textContent = post.title;

                const postContent = document.createElement('p');
                postContent.textContent = post.content;

                postDiv.append(postTitle, postContent);
                postsContainer.appendChild(postDiv);
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    function renderARFitting() {
        const arContainer = document.createElement('div');
        arContainer.className = 'ar-fitting';

        const header = document.createElement('h2');
        header.textContent = 'AR Virtual Fitting Room';

        const description = document.createElement('p');
        description.textContent = 'AR functionality will be implemented here.';

        app.innerHTML = '';
        arContainer.append(header, description);
        app.appendChild(arContainer);
    }

    function handleNewPost(e) {
        e.preventDefault();
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;

        fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ title, content })
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to create post');
            }
        }).then(() => {
            renderHome();
        }).catch(error => console.error('Error:', error));
    }

    function renderLogin() {
        app.innerHTML = `
            <h2>Login</h2>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#register">Register</a></p>
        `;

        document.getElementById('loginForm').addEventListener('submit', handleLogin);
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
        }).then(response => response.json())
        .then(data => {
            if (data.token) {
                currentUser = { username, token: data.token };
                document.getElementById('loginLink').textContent = 'Logout';
                renderHome();
            } else {
                alert('Invalid credentials');
            }
        }).catch(error => console.error('Error:', error));
    }

    function handleLogout() {
        currentUser = null;
        document.getElementById('loginLink').textContent = 'Login';
        renderHome();
    }

    function renderSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');

        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value;
            alert(`Search functionality for "${searchTerm}" will be implemented here.`);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value;
                alert(`Search functionality for "${searchTerm}" will be implemented here.`);
            }
        });
    }

    function renderCart() {
        app.innerHTML = `
            <h2>Shopping Cart</h2>
            <div id="cartItems"></div>
            <button id="checkoutButton">Proceed to Checkout</button>
        `;

        const cartItems = document.getElementById('cartItems');
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.textContent = `${item.name} - $${item.price}`;
                cartItems.appendChild(itemElement);
            });
        }

        document.getElementById('checkoutButton').addEventListener('click', () => {
            alert('Checkout functionality will be implemented here.');
        });
    }

    function renderProfile() {
        if (currentUser) {
            app.innerHTML = `
                <h2>User Profile</h2>
                <p>Username: ${currentUser.username}</p>
                <button id="logoutButton">Logout</button>
            `;
            document.getElementById('logoutButton').addEventListener('click', handleLogout);
        } else {
            renderLogin();
        }
    }

    // Event listeners
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('nav a')) {
            e.preventDefault();
            const page = e.target.getAttribute('href').substring(1);
            switch (page) {
                case 'home':
                    renderHome();
                    break;
                case 'ar-fitting':
                    renderARFitting();
                    break;
                case 'login':
                    if (currentUser) {
                        handleLogout();
                    } else {
                        renderLogin();
                    }
                    break;
            }
        }
    });

    document.getElementById('cartButton').addEventListener('click', renderCart);
    document.getElementById('profileButton').addEventListener('click', renderProfile);

    // Initialize search functionality
    renderSearch();

    // Initial rendering
    renderHome();
});
