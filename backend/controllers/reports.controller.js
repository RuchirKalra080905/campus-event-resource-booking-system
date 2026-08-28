// ================================================================
// Reports Controller - Admin analytics and CSV export
// Demonstrates: Complex JOINs, Aggregates, GROUP BY, HAVING, Subqueries
// ================================================================
const db = require('../config/db');

exports.getReports = async (req, res) => {
  try {
    const { report_type, date_from, date_to } = req.query;

    switch (report_type) {
      case 'popular_events': return await popularEvents(res, date_from, date_to);
      case 'events_by_category': return await eventsByCategory(res, date_from, date_to);
      case 'monthly_registrations': return await monthlyRegistrations(res, date_from, date_to);
      case 'resource_utilization': return await resourceUtilization(res, date_from, date_to);
      case 'popular_resources': return await popularResources(res, date_from, date_to);
      case 'venue_utilization': return await venueUtilization(res, date_from, date_to);
      case 'user_activity': return await userActivity(res, date_from, date_to);
      case 'booking_status': return await bookingStatus(res, date_from, date_to);
      default: return await allReports(res, date_from, date_to);
    }
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

async function popularEvents(res, from, to) {
  let query = `
    SELECT e.event_id, e.title, e.event_date, ec.category_name, u.name as organizer,
           v.venue_name,
           (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.attendance_status != 'cancelled') as registrations,
           COALESCE((SELECT AVG(rating) FROM event_feedback ef WHERE ef.event_id = e.event_id), 0) as avg_rating
    FROM events e
    LEFT JOIN event_categories ec ON e.category_id = ec.category_id
    LEFT JOIN users u ON e.organizer_id = u.user_id
    LEFT JOIN venues v ON e.venue_id = v.venue_id
    WHERE e.status IN ('approved','completed')
  `;
  const params = [];
  if (from) { query += ' AND e.event_date >= ?'; params.push(from); }
  if (to) { query += ' AND e.event_date <= ?'; params.push(to); }
  query += ' ORDER BY registrations DESC LIMIT 20';
  const [data] = await db.query(query, params);
  res.json({ report: 'popular_events', data });
}

async function eventsByCategory(res, from, to) {
  let query = `
    SELECT ec.category_name, COUNT(e.event_id) as event_count,
           COALESCE(SUM((SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.attendance_status != 'cancelled')), 0) as total_registrations,
           COALESCE(AVG((SELECT AVG(rating) FROM event_feedback ef WHERE ef.event_id = e.event_id)), 0) as avg_rating
    FROM event_categories ec
    LEFT JOIN events e ON ec.category_id = e.category_id AND e.status IN ('approved','completed')
  `;
  const params = [];
  if (from) { query += ' AND e.event_date >= ?'; params.push(from); }
  if (to) { query += ' AND e.event_date <= ?'; params.push(to); }
  query += ' GROUP BY ec.category_id, ec.category_name ORDER BY event_count DESC';
  const [data] = await db.query(query, params);
  res.json({ report: 'events_by_category', data });
}

async function monthlyRegistrations(res, from, to) {
  let query = `
    SELECT DATE_FORMAT(er.registration_date, '%Y-%m') as month,
           DATE_FORMAT(er.registration_date, '%b %Y') as label,
           COUNT(*) as registrations
    FROM event_registrations er
    WHERE er.attendance_status != 'cancelled'
  `;
  const params = [];
  if (from) { query += ' AND er.registration_date >= ?'; params.push(from); }
  if (to) { query += ' AND er.registration_date <= ?'; params.push(to); }
  query += ' GROUP BY month, label ORDER BY month ASC';
  const [data] = await db.query(query, params);
  res.json({ report: 'monthly_registrations', data });
}

async function resourceUtilization(res, from, to) {
  const [data] = await db.query(`
    SELECT r.resource_name, r.resource_type, r.quantity as total,
           r.available_quantity as available,
           (r.quantity - r.available_quantity) as in_use,
           ROUND(((r.quantity - r.available_quantity) / r.quantity) * 100, 1) as utilization_pct
    FROM resources r ORDER BY utilization_pct DESC
  `);
  res.json({ report: 'resource_utilization', data });
}

async function popularResources(res, from, to) {
  let query = `
    SELECT r.resource_name, r.resource_type,
           COUNT(rb.booking_id) as total_bookings,
           SUM(rb.quantity) as total_quantity_booked
    FROM resources r
    LEFT JOIN resource_bookings rb ON r.resource_id = rb.resource_id
    WHERE 1=1
  `;
  const params = [];
  if (from) { query += ' AND rb.booking_date >= ?'; params.push(from); }
  if (to) { query += ' AND rb.booking_date <= ?'; params.push(to); }
  query += ' GROUP BY r.resource_id, r.resource_name, r.resource_type HAVING total_bookings > 0 ORDER BY total_bookings DESC';
  const [data] = await db.query(query, params);
  res.json({ report: 'popular_resources', data });
}

async function venueUtilization(res, from, to) {
  let query = `
    SELECT v.venue_name, v.building, v.capacity,
           COUNT(e.event_id) as events_hosted,
           COALESCE(SUM((SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.attendance_status != 'cancelled')), 0) as total_attendees
    FROM venues v
    LEFT JOIN events e ON v.venue_id = e.venue_id AND e.status IN ('approved','completed')
  `;
  const params = [];
  if (from) { query += ' AND e.event_date >= ?'; params.push(from); }
  if (to) { query += ' AND e.event_date <= ?'; params.push(to); }
  query += ' GROUP BY v.venue_id, v.venue_name, v.building, v.capacity ORDER BY events_hosted DESC';
  const [data] = await db.query(query, params);
  res.json({ report: 'venue_utilization', data });
}

async function userActivity(res, from, to) {
  const [data] = await db.query(`
    SELECT u.name, u.email, u.role, u.department,
           (SELECT COUNT(*) FROM event_registrations er WHERE er.user_id = u.user_id AND er.attendance_status != 'cancelled') as event_registrations,
           (SELECT COUNT(*) FROM resource_bookings rb WHERE rb.user_id = u.user_id) as resource_bookings,
           (SELECT COUNT(*) FROM events e WHERE e.organizer_id = u.user_id) as events_organized
    FROM users u
    ORDER BY event_registrations DESC LIMIT 50
  `);
  res.json({ report: 'user_activity', data });
}

async function bookingStatus(res, from, to) {
  let query = `
    SELECT rb.status, COUNT(*) as count, SUM(rb.quantity) as total_quantity
    FROM resource_bookings rb WHERE 1=1
  `;
  const params = [];
  if (from) { query += ' AND rb.booking_date >= ?'; params.push(from); }
  if (to) { query += ' AND rb.booking_date <= ?'; params.push(to); }
  query += ' GROUP BY rb.status';
  const [data] = await db.query(query, params);
  res.json({ report: 'booking_status', data });
}

async function allReports(res, from, to) {
  // Return summary of all reports
  const [eventCount] = await db.query("SELECT COUNT(*) as count FROM events WHERE status IN ('approved','completed')");
  const [regCount] = await db.query("SELECT COUNT(*) as count FROM event_registrations WHERE attendance_status != 'cancelled'");
  const [bookingCount] = await db.query('SELECT COUNT(*) as count FROM resource_bookings');
  const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
  
  res.json({
    summary: {
      total_events: eventCount[0].count,
      total_registrations: regCount[0].count,
      total_bookings: bookingCount[0].count,
      total_users: userCount[0].count
    }
  });
}
