// Import modules
const express = require('express'); // Web application framework for Node.js
const fs = require('fs'); // File system module for reading and writing files
const bcrypt = require('bcrypt'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for creating and verifying JSON Web Tokens
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing

// Initialize Express application
const app = express();
const port = 3001; // Port number on which the server will run
const SECRET_KEY = 'your_secret_key_here'; // Secret key for JWT signing (should be kept secret in production)

// Middleware setup
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

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

// Route for user registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body
  const users = readUsers(); // Read existing users
  
  // Check if the username already exists
  if (users.users.some(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists.' });
  }
  
  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);
  users.users.push({ username, password: hashedPassword }); // Add new user to users array
  writeUsers(users); // Write updated users to file
  
  res.status(201).json({ message: 'User registered successfully.' });
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

// Route to get all posts
app.get('/api/posts', (req, res) => {
  const posts = readPosts(); // Read all posts
  res.json(posts); // Send posts as JSON response
});

// Route to create a new post
app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body; // Extract post details from request body
  const posts = readPosts(); // Read existing posts
  const newPost = { id: Date.now(), title, content, author }; // Create new post object
  posts.posts.push(newPost); // Add new post to posts array
  writePosts(posts); // Write updated posts to file
  res.status(201).json(newPost); // Send new post as JSON response
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
