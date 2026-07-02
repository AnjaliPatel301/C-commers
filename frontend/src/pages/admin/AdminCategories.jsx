import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiChevronDown, FiChevronUp, FiTag } from 'react-icons/fi';
import { categoryAPI } from '../../services/api';
import { AdminNav } from './AdminDashboard';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Category form state
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Type form state (per category)
  const [newTypes, setNewTypes] = useState({});
  const [addingType, setAddingType] = useState({});
  const [editingType, setEditingType] = useState({}); // { catId: { oldType, newVal } }

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryAPI.getAllAdmin();
      setCategories(data.categories || []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Category CRUD ──────────────────────────────────────────────
  const openAddCat = () => { setCatName(''); setEditingCat(null); setShowCatForm(true); };
  const openEditCat = (cat) => { setCatName(cat.name); setEditingCat(cat); setShowCatForm(true); };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    try {
      if (editingCat) {
        await categoryAPI.update(editingCat._id, { name: catName.trim() });
        toast.success('Category updated!');
      } else {
        await categoryAPI.create({ name: catName.trim() });
        toast.success('Category added!');
      }
      setShowCatForm(false);
      fetchCategories();
    } catch (err) { toast.error(err.message || 'Failed to save category'); }
    finally { setSavingCat(false); }
  };

  const handleDeleteCat = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      await categoryAPI.delete(cat._id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) { toast.error(err.message || 'Failed to delete'); }
  };

  const handleToggleActive = async (cat) => {
    try {
      await categoryAPI.update(cat._id, { isActive: !cat.isActive });
      toast.success(cat.isActive ? 'Category hidden' : 'Category activated');
      fetchCategories();
    } catch (err) { toast.error(err.message || 'Failed to update'); }
  };

  // ── Type CRUD ──────────────────────────────────────────────────
  const handleAddType = async (catId) => {
    const type = (newTypes[catId] || '').trim();
    if (!type) return;
    setAddingType(p => ({ ...p, [catId]: true }));
    try {
      const data = await categoryAPI.addType(catId, type);
      setCategories(prev => prev.map(c => c._id === catId ? data.category : c));
      setNewTypes(p => ({ ...p, [catId]: '' }));
      toast.success(`"${type}" type added!`);
    } catch (err) { toast.error(err.message || 'Failed to add type'); }
    finally { setAddingType(p => ({ ...p, [catId]: false })); }
  };

  const handleDeleteType = async (catId, type) => {
    if (!window.confirm(`Delete type "${type}"?`)) return;
    try {
      const data = await categoryAPI.removeType(catId, type);
      setCategories(prev => prev.map(c => c._id === catId ? data.category : c));
      toast.success(`"${type}" removed`);
    } catch (err) { toast.error(err.message || 'Failed to remove type'); }
  };

  const startRenameType = (catId, type) => {
    setEditingType(p => ({ ...p, [catId]: { oldType: type, newVal: type } }));
  };

  const handleRenameType = async (catId) => {
    const { oldType, newVal } = editingType[catId] || {};
    if (!newVal?.trim() || newVal.trim() === oldType) {
      setEditingType(p => { const n = { ...p }; delete n[catId]; return n; });
      return;
    }
    try {
      const data = await categoryAPI.renameType(catId, oldType, newVal.trim());
      setCategories(prev => prev.map(c => c._id === catId ? data.category : c));
      setEditingType(p => { const n = { ...p }; delete n[catId]; return n; });
      toast.success('Type renamed!');
    } catch (err) { toast.error(err.message || 'Failed to rename type'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 mt-1">Manage categories and their product types</p>
          </div>
          <Button variant="primary" onClick={openAddCat}>
            <FiPlus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <FiTag className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold">How it works</p>
            <p className="mt-0.5">Pehle category banao (jaise <strong>Saree</strong>), phir uske andar types add karo (jaise <strong>Silk Saree</strong>, <strong>Banarasi Saree</strong>, <strong>Cotton Saree</strong>). Yahi types product form mein select honge.</p>
          </div>
        </div>

        {/* Category List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
            <p className="text-5xl mb-3">🗂️</p>
            <p className="font-medium text-lg">No categories yet</p>
            <p className="text-sm mt-1">Click "Add Category" to create your first category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(cat => (
              <motion.div key={cat._id} layout
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cat.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>

                {/* Category Header */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">{cat.name}</span>
                      {!cat.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Hidden</span>}
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{cat.types.length} types</span>
                    </div>
                    {cat.types.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{cat.types.join(' · ')}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => handleToggleActive(cat)} title={cat.isActive ? 'Hide' : 'Show'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat.isActive ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </button>
                    <button onClick={() => openEditCat(cat)}
                      className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCat(cat)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpandedId(id => id === cat._id ? null : cat._id)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      {expandedId === cat._id ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Types Panel */}
                <AnimatePresence>
                  {expandedId === cat._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="px-5 py-4 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Product Types under "{cat.name}"
                        </p>

                        {/* Type List */}
                        {cat.types.length === 0 ? (
                          <p className="text-sm text-gray-400 italic mb-3">Koi type nahi hai — neeche add karo</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {cat.types.map(type => (
                              <div key={type} className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {editingType[cat._id]?.oldType === type ? (
                                  // Inline rename input
                                  <div className="flex items-center gap-1 px-2 py-1">
                                    <input
                                      autoFocus
                                      value={editingType[cat._id]?.newVal || ''}
                                      onChange={e => setEditingType(p => ({ ...p, [cat._id]: { ...p[cat._id], newVal: e.target.value } }))}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') handleRenameType(cat._id);
                                        if (e.key === 'Escape') setEditingType(p => { const n = {...p}; delete n[cat._id]; return n; });
                                      }}
                                      className="text-sm border-b border-blue-400 focus:outline-none bg-transparent w-32 px-0.5"
                                    />
                                    <button onClick={() => handleRenameType(cat._id)} className="text-green-500 hover:text-green-600">
                                      <FiCheck className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setEditingType(p => { const n = {...p}; delete n[cat._id]; return n; })} className="text-gray-400 hover:text-gray-600">
                                      <FiX className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-sm text-gray-700 font-medium px-3 py-2">{type}</span>
                                    <button onClick={() => startRenameType(cat._id, type)}
                                      className="px-1.5 py-2 text-gray-300 hover:text-blue-500 transition-colors">
                                      <FiEdit2 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => handleDeleteType(cat._id, type)}
                                      className="pr-2 py-2 text-gray-300 hover:text-red-500 transition-colors">
                                      <FiX className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add type input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTypes[cat._id] || ''}
                            onChange={e => setNewTypes(p => ({ ...p, [cat._id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddType(cat._id); } }}
                            placeholder={`Type name, e.g. "Silk ${cat.name}"`}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                          />
                          <button
                            onClick={() => handleAddType(cat._id)}
                            disabled={addingType[cat._id]}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <FiPlus className="w-4 h-4" />
                            {addingType[cat._id] ? 'Adding...' : 'Add Type'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Category Name Modal */}
        <AnimatePresence>
          {showCatForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-800 text-lg">{editingCat ? 'Rename Category' : 'Add New Category'}</h2>
                  <button onClick={() => setShowCatForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveCat} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Category Name *</label>
                    <input
                      autoFocus
                      value={catName}
                      onChange={e => setCatName(e.target.value)}
                      required
                      className="input-field"
                      placeholder="e.g. Saree, Kurti, Lehenga, Men, Women"
                    />
                    <p className="text-xs text-gray-400 mt-1">Types aap baad mein ▼ button se add kar sakte hain</p>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="ghost" onClick={() => setShowCatForm(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" loading={savingCat} fullWidth>
                      {editingCat ? 'Save' : 'Create Category'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
