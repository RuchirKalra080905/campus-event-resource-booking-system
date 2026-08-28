import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Tag, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({
    category_name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({ category_name: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setForm({
      category_name: c.category_name,
      description: c.description || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.category_id}`, form);
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', form);
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (categoryId, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Event Categories</h1>
          <p className="text-sm text-surface-500">Organize campus activities into thematic classifications</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map(c => (
            <div
              key={c.category_id}
              className="bg-white rounded-xl shadow-sm border border-surface-100 p-5 flex flex-col justify-between card-hover"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-base text-surface-800 flex items-center gap-2">
                    <Tag size={16} className="text-primary-600" />
                    {c.category_name}
                  </span>
                  <span className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full font-medium">
                    {c.event_count || 0} events
                  </span>
                </div>
                <p className="text-xs text-surface-600 line-clamp-3 mt-1">
                  {c.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-surface-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 hover:bg-surface-100 rounded-lg text-surface-600 hover:text-primary-600"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(c.category_id, c.category_name)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-surface-600 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-surface-800 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="input-label">Category Name *</label>
                <input
                  type="text"
                  required
                  value={form.category_name}
                  onChange={e => setForm(f => ({ ...f, category_name: e.target.value }))}
                  className="input"
                  placeholder="e.g. Technical, Sports, Workshop"
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input"
                  placeholder="Describe the scope of events in this category..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-100">
                <button type="submit" className="btn btn-primary flex-1">
                  Save Category
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
