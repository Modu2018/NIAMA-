const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// DB connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// User schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', UserSchema);

// Post schema
const PostSchema = new mongoose.Schema({
  text: String,
  author: String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await require('bcryptjs').hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: 'User registered' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'Invalid user' });
  const valid = await require('bcryptjs').compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
  const token = require('jsonwebtoken').sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Create post
app.post('/api/posts', async (req, res) => {
  const { text, author } = req.body;
  const post = new Post({ text, author });
  await post.save();
  res.json(post);
});

// Get posts
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
