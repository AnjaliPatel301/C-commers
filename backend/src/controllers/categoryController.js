const Category = require('../models/Category');

// Get all active categories (public)
exports.getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, categories });
};

// Get all categories including inactive (admin)
exports.getAllCategories = async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, categories });
};

// Create category
exports.createCategory = async (req, res) => {
  const { name, types } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) return res.status(400).json({ success: false, message: 'Category already exists' });
  const category = await Category.create({ name: name.trim(), types: types || [] });
  res.status(201).json({ success: true, category });
};

// Update category name / active status
exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};

// Delete category
exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, message: 'Category deleted' });
};

// Add a type to a category
exports.addType = async (req, res) => {
  const { type } = req.body;
  if (!type) return res.status(400).json({ success: false, message: 'Type name is required' });
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  if (category.types.includes(type.trim())) {
    return res.status(400).json({ success: false, message: 'Type already exists in this category' });
  }
  category.types.push(type.trim());
  await category.save();
  res.json({ success: true, category });
};

// Remove a type from a category
exports.removeType = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  category.types = category.types.filter(t => t !== req.params.type);
  await category.save();
  res.json({ success: true, category });
};

// Rename a type
exports.renameType = async (req, res) => {
  const { oldType, newType } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const idx = category.types.indexOf(oldType);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Type not found' });
  category.types[idx] = newType.trim();
  await category.save();
  res.json({ success: true, category });
};
