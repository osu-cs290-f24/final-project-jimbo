// Import modules
const express = require('express'); // Web application framework for Node.js
const fs = require('fs'); // File system module for reading and writing files
const bcrypt = require('bcrypt'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for creating and verifying JSON Web Tokens
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Initialize Express application
const app = express();
const port = 3003; // Port number on which the server will run
const SECRET_KEY = 'your_secret_key_here'; // Secret key for JWT signing (should be kept secret in production)

// Middleware setup
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes
app.use('/uploads', express.static('public/uploads'));
app.use('/uploads', express.static('uploads'));

// Function to read users from JSON file
function readUsers() {
  try {
    const data = fs.readFileSync('users.json'); // Read the users.json file
    return JSON.parse(data); // Parse the JSON data and return it
  } catch (error) {
    // If the file doesn't exist or there's an error, create a new users object
    const users = { users: [] };
    writeUsers(users); // Write the empty users object to the file
    return users;
  }
}

// Function to write users to JSON file
function writeUsers(users) {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2)); // Write users object to users.json file
}

// Function to read posts from JSON file
function readPosts() {
  try {
    const data = fs.readFileSync('posts.json'); // Read the posts.json file
    return JSON.parse(data); // Parse the JSON data and return it
  } catch (error) {
    // If the file doesn't exist or there's an error, create a new posts object
    const posts = { posts: [] };
    writePosts(posts); // Write the empty posts object to the file
    return posts;
  }
}

// Function to write posts to JSON file
function writePosts(posts) {
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2)); // Write posts object to posts.json file
}

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route for user registration
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  const users = readUsers();
  
  if (users.users.some(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists.' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  users.users.push({ 
    username, 
    password: hashedPassword,
    email,
    profilePicture: '', // 기본 프로필 사진 URL
    followers: [],
    following: []
  });
  writeUsers(users);
  
  res.status(201).json({ message: 'User registered successfully.' });
});

app.post('/api/follow/:username', authenticateToken, (req, res) => {
  const users = readUsers();
  const userToFollow = users.users.find(user => user.username === req.params.username);
  const currentUser = users.users.find(user => user.username === req.user.username);

  if (!userToFollow || !currentUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!currentUser.following.includes(userToFollow.username)) {
    currentUser.following.push(userToFollow.username);
    userToFollow.followers.push(currentUser.username);
    writeUsers(users);
    res.json({ message: 'User followed successfully' });
  } else {
    res.status(400).json({ message: 'Already following this user' });
  }
});

app.get('/api/home', authenticateToken, (req, res) => {
  try {
    const posts = readPosts();
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    posts.posts.sort((a, b) => b.id - a.id);
    const paginatedPosts = posts.posts.slice(startIndex, endIndex);
    const hasMore = endIndex < posts.posts.length;

    res.json({ 
      posts: paginatedPosts,
      hasMore: hasMore,
      totalPosts: posts.posts.length
    });
  } catch(error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for user login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  const users = readUsers(); // Read existing users
  const user = users.users.find(user => user.username === username); // Find user by username
  
  // Check if user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  
  // Generate JWT token
  const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token, username: user.username });
});

// Route to verify JWT token
app.get('/api/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  // Verify the token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true, username: decoded.username });
  });
});

app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  const { content } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  if (!imageUrl) {
    return res.status(400).json({ message: 'Image is required' });
  }

  const posts = readPosts();
  const newPost = {
    id: Date.now(),
    content,
    author: req.user.username,
    imageUrl,
    likes: 0,
    comments: []
  };

  posts.posts.unshift(newPost);
  writePosts(posts);

  res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const posts = readPosts();
  const post = posts.posts.find(p => p.id === postId);
  
  if (post) {
    if (!post.likedBy) {
      post.likedBy = [];
    }
    
    const userIndex = post.likedBy.indexOf(req.user.username);
    if (userIndex === -1) {
      post.likes++;
      post.likedBy.push(req.user.username);
    } else {
      post.likes--;
      post.likedBy.splice(userIndex, 1);
    }
    
    writePosts(posts);
    res.json({ success: true, likes: post.likes, liked: userIndex === -1 });
  } else {
    res.status(404).json({ success: false, message: 'Post not found' });
  }
});

// Route to add a comment to a post
app.post('/api/posts/:id/comment', (req, res) => {
  const postId = parseInt(req.params.id);
  const { author, content } = req.body;
  const posts = readPosts();
  const post = posts.posts.find(p => p.id === postId);
  if (post) {
    const newComment = { author, content, id: Date.now() };
    post.comments.push(newComment);
    writePosts(posts);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
