import { dataService } from '../services/dataService.js';

export const getCategories = async (req, res) => {
  try {
    const onlyActive = req.query.all !== 'true';
    const categories = await dataService.getCategories(onlyActive);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await dataService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive, displayOrder } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await dataService.createCategory({
      name,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: Number(displayOrder) || 0
    });

    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updated = await dataService.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category updated', category: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update category' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const deleted = await dataService.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

