// Audit Logs Controller
const db = require('../config/db');

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, table_name, user_id, page = 1, limit = 50 } = req.query;
    let query = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM audit_logs al LEFT JOIN users u ON al.user_id = u.user_id WHERE 1=1
    `;
    const params = [];
    if (action) { query += ' AND al.action = ?'; params.push(action); }
    if (table_name) { query += ' AND al.table_name = ?'; params.push(table_name); }
    if (user_id) { query += ' AND al.user_id = ?'; params.push(user_id); }
    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const [logs] = await db.query(query, params);
    const [total] = await db.query('SELECT COUNT(*) as count FROM audit_logs');
    res.json({ logs, total: total[0].count });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch audit logs' }); }
};
