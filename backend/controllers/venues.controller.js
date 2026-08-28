// ================================================================
// Venues Controller - CRUD, Availability Check
// ================================================================
const db = require('../config/db');

exports.getVenues = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM venues WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (venue_name LIKE ? OR building LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY venue_name ASC';
    const [venues] = await db.query(query, params);
    res.json(venues);
  } catch (error) { console.error('Get venues error:', error); res.status(500).json({ error: 'Failed to fetch venues' }); }
};

exports.getVenue = async (req, res) => {
  try {
    const [venues] = await db.query('SELECT * FROM venues WHERE venue_id = ?', [req.params.id]);
    if (venues.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json(venues[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch venue' }); }
};

exports.createVenue = async (req, res) => {
  try {
    const { venue_name, building, floor, capacity, location, facilities, status } = req.body;
    if (!venue_name || !building || !capacity) return res.status(400).json({ error: 'Name, building, and capacity are required' });
    const [result] = await db.query(
      'INSERT INTO venues (venue_name, building, floor, capacity, location, facilities, status) VALUES (?,?,?,?,?,?,?)',
      [venue_name, building, floor || null, capacity, location || null, facilities || null, status || 'available']
    );
    await db.query('INSERT INTO audit_logs (user_id, action, table_name, record_id, description) VALUES (?,?,?,?,?)',
      [req.user.user_id, 'CREATE', 'venues', result.insertId, `Venue created: ${venue_name}`]);
    res.status(201).json({ message: 'Venue created', venue_id: result.insertId });
  } catch (error) { console.error('Create venue error:', error); res.status(500).json({ error: 'Failed to create venue' }); }
};

exports.updateVenue = async (req, res) => {
  try {
    const { venue_name, building, floor, capacity, location, facilities, status } = req.body;
    await db.query(
      `UPDATE venues SET venue_name=COALESCE(?,venue_name), building=COALESCE(?,building), floor=COALESCE(?,floor),
       capacity=COALESCE(?,capacity), location=COALESCE(?,location), facilities=COALESCE(?,facilities),
       status=COALESCE(?,status) WHERE venue_id=?`,
      [venue_name, building, floor, capacity, location, facilities, status, req.params.id]
    );
    res.json({ message: 'Venue updated' });
  } catch (error) { res.status(500).json({ error: 'Failed to update venue' }); }
};

exports.deleteVenue = async (req, res) => {
  try {
    const [events] = await db.query("SELECT COUNT(*) as count FROM events WHERE venue_id = ? AND status IN ('pending','approved')", [req.params.id]);
    if (events[0].count > 0) return res.status(400).json({ error: 'Cannot delete venue with active events' });
    await db.query('DELETE FROM venues WHERE venue_id = ?', [req.params.id]);
    res.json({ message: 'Venue deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete venue' }); }
};

// Check venue availability for a specific date/time
exports.checkAvailability = async (req, res) => {
  try {
    const { venue_id, date, start_time, end_time } = req.query;
    const [conflicts] = await db.query(`
      SELECT event_id, title, start_time, end_time FROM events
      WHERE venue_id = ? AND event_date = ? AND status IN ('approved','pending')
        AND start_time < ? AND end_time > ?
      ORDER BY start_time
    `, [venue_id, date, end_time, start_time]);
    res.json({ available: conflicts.length === 0, conflicts });
  } catch (error) { res.status(500).json({ error: 'Failed to check availability' }); }
};
