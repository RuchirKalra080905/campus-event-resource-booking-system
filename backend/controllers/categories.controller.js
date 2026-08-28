// ================================================================
// Categories Controller - Event category CRUD
// ================================================================
const db = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT ec.*, COUNT(e.event_id) AS event_count
      FROM event_categories ec
      LEFT JOIN events e ON ec.category_id = e.category_id
      GROUP BY ec.category_id
      ORDER BY ec.category_name
    `);
    res.json(categories);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch categories' }); }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name) return res.status(400).json({ error: 'Category name is required' });
    const [result] = await db.query('INSERT INTO event_categories (category_name, description) VALUES (?,?)', [category_name, description || null]);
    res.status(201).json({ message: 'Category created', category_id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Category already exists' });
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    await db.query('UPDATE event_categories SET category_name=COALESCE(?,category_name), description=COALESCE(?,description) WHERE category_id=?',
      [category_name, description, req.params.id]);
    res.json({ message: 'Category updated' });
  } catch (error) { res.status(500).json({ error: 'Failed to update category' }); }
};

exports.deleteCategory = async (req, res) => {
  try {
    await db.query('DELETE FROM event_categories WHERE category_id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) { res.status(500).json({ error: 'Failed to delete category' }); }
};
