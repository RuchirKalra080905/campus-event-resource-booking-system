// ================================================================
// Auth Controller - Register, Login, Profile
// Demonstrates: Password hashing, JWT, Parameterized queries
// ================================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, department } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password with bcrypt (10 salt rounds)
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user (parameterized query prevents SQL injection)
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, role, department) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, phone || null, role || 'student', department || null]
    );

    // Log the registration in audit_logs
    await db.query(
      'INSERT INTO audit_logs (user_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, 'CREATE', 'users', result.insertId, `New ${role || 'student'} registered: ${email}`]
    );

    // Generate JWT
    const token = jwt.sign(
      { user_id: result.insertId, email, role: role || 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create welcome notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [result.insertId, 'Welcome to Campus Hub!', 'Your account has been created successfully. Explore events and resources on campus.', 'success']
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { user_id: result.insertId, name, email, role: role || 'student', department }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email (parameterized query)
    const [users] = await db.query(
      'SELECT user_id, name, email, password_hash, role, department, phone FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data (never expose password_hash)
    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, name, email, phone, role, department, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    
    await db.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), department = COALESCE(?, department) WHERE user_id = ?',
      [name, phone, department, req.user.user_id]
    );

    const [users] = await db.query(
      'SELECT user_id, name, email, phone, role, department, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    res.json({ message: 'Profile updated', user: users[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
