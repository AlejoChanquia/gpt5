const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { SECRET } = require('./middleware.auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!['teacher', 'student'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  stmt.run(name, email, hashed, role, function(err) {
    if (err) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.json({ id: this.lastID, name, email, role });
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
    return res.json({ token, name: user.name, email: user.email, role: user.role });
  });
});

module.exports = router;
