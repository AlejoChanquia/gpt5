const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');
const db = require('./db');
const { SECRET, authenticate } = require('./middleware.auth');

const router = express.Router();

router.post('/register', (req, res) => {
  let { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (role && role !== 'student' && role !== 'teacher') {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (!role) role = 'student';
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
    return res.status(400).json({ error: 'Weak password' });
  }

  const safeName = sanitizeHtml(name);
  const hashed = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (name, email, password, role, preferences) VALUES (?, ?, ?, ?, ?)');
  stmt.run(safeName, email, hashed, role, null, function(err) {
    if (err) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.json({ id: this.lastID, name: safeName, email, role, preferences: null });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
    return res.json({ token, id: user.id, name: user.name, email: user.email, role: user.role, preferences: user.preferences });
  });
});

router.put('/preferences', authenticate, (req, res) => {
  const { preferences } = req.body;
  db.run('UPDATE users SET preferences = ? WHERE id = ?', [preferences, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    return res.json({ success: true });
  });
});

router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  db.get('SELECT id, name, role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    db.all('SELECT * FROM courses WHERE author_id = ?', [userId], (err, courses) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ user, courses });
    });
  });
});

module.exports = router;
