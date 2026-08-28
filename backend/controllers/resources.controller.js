// ================================================================
// Resources Controller - CRUD, Search, Filter
// Demonstrates: Parameterized queries, Aggregate queries
// ================================================================
const db = require('../config/db');

// GET /api/resources
exports.getResources = async (req, res) => {
  try {
    const { search, type, status, available } = req.query;
    
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (resource_name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (type) {
      query += ' AND resource_type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (available === 'true') {
      query += ' AND status = ? AND available_quantity > 0';
      params.push('available');
    }

    query += ' ORDER BY resource_name ASC';

    const [resources] = await db.query(query, params);

    // Get unique resource types for filter dropdown
    const [types] = await db.query('SELECT DISTINCT resource_type FROM resources ORDER BY resource_type');

    res.json({ resources, types: types.map(t => t.resource_type) });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// GET /api/resources/:id
exports.getResource = async (req, res) => {
  try {
    const [resources] = await db.query('SELECT * FROM resources WHERE resource_id = ?', [req.params.id]);
    if (resources.length === 0) return res.status(404).json({ error: 'Resource not found' });
    res.json(resources[0]);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
};

// POST /api/resources (Admin)
exports.createResource = async (req, res) => {
  try {
    const { resource_name, resource_type, description, quantity, location, status } = req.body;

    if (!resource_name || !resource_type || !quantity) {
      return res.status(400).json({ error: 'Name, type, and quantity are required' });
    }

    const [result] = await db.query(
      `INSERT INTO resources (resource_name, resource_type, description, quantity, available_quantity, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [resource_name, resource_type, description || null, quantity, quantity, location || null, status || 'available']
    );

    await db.query(
      'INSERT INTO audit_logs (user_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'CREATE', 'resources', result.insertId, `Resource created: ${resource_name}`]
    );

    res.status(201).json({ message: 'Resource created', resource_id: result.insertId });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

// PUT /api/resources/:id (Admin)
exports.updateResource = async (req, res) => {
  try {
    const { resource_name, resource_type, description, quantity, available_quantity, location, status } = req.body;
    
    await db.query(
      `UPDATE resources SET resource_name = COALESCE(?, resource_name), resource_type = COALESCE(?, resource_type),
       description = COALESCE(?, description), quantity = COALESCE(?, quantity),
       available_quantity = COALESCE(?, available_quantity), location = COALESCE(?, location),
       status = COALESCE(?, status) WHERE resource_id = ?`,
      [resource_name, resource_type, description, quantity, available_quantity, location, status, req.params.id]
    );

    res.json({ message: 'Resource updated' });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
};

// DELETE /api/resources/:id (Admin)
exports.deleteResource = async (req, res) => {
  try {
    // Check for active bookings before deletion
    const [bookings] = await db.query(
      'SELECT COUNT(*) as count FROM resource_bookings WHERE resource_id = ? AND status IN (?, ?)',
      [req.params.id, 'pending', 'approved']
    );
    if (bookings[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete resource with active bookings' });
    }

    await db.query('DELETE FROM resources WHERE resource_id = ?', [req.params.id]);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
