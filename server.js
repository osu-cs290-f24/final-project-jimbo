const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_secret_key_here';

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

function readUsers() {
  try {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
  } catch (error) {
    const users = { users: [] };
    writeUsers(users);
    return users;
  }
}

function writeUsers(users) {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

function readPosts() {
  try {
    const data = fs.readFileSync('posts.json');
    return JSON.parse(data);
  } catch (error) {
    const posts = { posts: [] };
    writePosts(posts);
    return posts;
  }
}

function writePosts(posts) {
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  
  if (users.users.some(user => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists.' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  users.users.push({ username, password: hashedPassword });
  writeUsers(users);
  
  res.status(201).json({ message: 'User registered successfully.' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.users.find(user => user.username === username);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  
  const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token, username: user.username });
});

app.get('/api/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true, username: decoded.username });
  });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
app.get('/api/posts', (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;
  const posts = readPosts();
  const newPost = { id: Date.now(), title, content, author };
  posts.posts.push(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
