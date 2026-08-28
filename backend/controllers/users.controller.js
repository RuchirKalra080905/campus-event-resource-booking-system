// ================================================================
// Users Controller (Admin) - User management
// ================================================================
const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const { search, role, department } = req.query;
    let query = 'SELECT user_id, name, email, phone, role, department, created_at FROM users WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (role) { query += ' AND role = ?'; params.push(role); }
    if (department) { query += ' AND department = ?'; params.push(department); }
    query += ' ORDER BY created_at DESC';
    const [users] = await db.query(query, params);
    res.json(users);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch users' }); }
};

exports.getUser = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, name, email, phone, role, department, created_at FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch user' }); }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, department } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already exists' });
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, role, department) VALUES (?,?,?,?,?,?)',
      [name, email, password_hash, phone || null, role || 'student', department || null]
    );
    res.status(201).json({ message: 'User created', user_id: result.insertId });
  } catch (error) { res.status(500).json({ error: 'Failed to create user' }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, department } = req.body;
    await db.query(
      'UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone), role=COALESCE(?,role), department=COALESCE(?,department) WHERE user_id=?',
      [name, email, phone, role, department, req.params.id]
    );
    res.json({ message: 'User updated' });
  } catch (error) { res.status(500).json({ error: 'Failed to update user' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.user_id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete user' }); }
};
