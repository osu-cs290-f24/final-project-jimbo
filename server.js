const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

let posts = [];
let users = [];

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

function generateToken(userId) {
    return jwt.sign({ userId }, 'secret_key');
}

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await hashPassword(password);
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user.username);
    res.json({ token });
});

app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.post('/api/posts', (req, res) => {
    const newPost = req.body;
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        posts.push({ ...newPost, author: decoded.userId });
        res.status(201).json(newPost);
    });
});

app.listen(port, () => {
    console.log(`StyleShare app listening at http://localhost:${port}`);
});
