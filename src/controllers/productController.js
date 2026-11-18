import { dataService } from '../services/dataService.js';

// Public - No purchasePrice exposed
export const getPublicProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      inStockOnly,
      featuredOnly,
      newArrivalOnly,
      bestSellerOnly,
      page,
      limit
    } = req.query;

    const result = await dataService.getProducts({
      category,
      search,
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) || Infinity,
      sortBy: sortBy || 'newest',
      inStockOnly: inStockOnly === 'true',
      featuredOnly: featuredOnly === 'true',
      newArrivalOnly: newArrivalOnly === 'true',
      bestSellerOnly: bestSellerOnly === 'true',
      isAdmin: false,
      page: Number(page) || 1,
      limit: Number(limit) || 40
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
};

export const getPublicProductById = async (req, res) => {
  try {
    const product = await dataService.getProductById(req.params.id, false);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Also fetch 4 related products in the same category
    let related = [];
    if (product.categoryName) {
      const relatedRes = await dataService.getProducts({
        category: product.categoryName,
        isAdmin: false,
        limit: 5
      });
      related = relatedRes.products.filter(p => p._id !== product._id).slice(0, 4);
    }

    res.json({
      success: true,
      product,
      related
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product details' });
  }
};

// Admin - Full access including purchasePrice
export const getAdminProducts = async (req, res) => {
  try {
    const { category, search, page, limit, stockStatus } = req.query;
    let result = await dataService.getProducts({
      category,
      search,
      isAdmin: true,
      page: Number(page) || 1,
      limit: Number(limit) || 100
    });

    if (stockStatus) {
      result.products = result.products.filter(p => p.stockStatus === stockStatus);
      result.total = result.products.length;
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin products' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      categoryName,
      description,
      images,
      purchasePrice,
      sellingPrice,
      originalPrice,
      stockQuantity,
      lowStockThreshold,
      isActive,
      isFeatured,
      isNewArrival,
      isBestSeller,
      specifications
    } = req.body;

    if (!name || sellingPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Product name and selling price are required.' });
    }

    const adminUser = req.admin?.name || 'Admin';
    const product = await dataService.createProduct({
      name,
      sku,
      category,
      categoryName: categoryName || 'Jewellery',
      description,
      images: images || [],
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice),
      originalPrice: Number(originalPrice) || Number(sellingPrice),
      stockQuantity: Number(stockQuantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      isBestSeller: Boolean(isBestSeller),
      specifications: specifications || {}
    }, adminUser);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const adminUser = req.admin?.name || 'Admin';
    const product = await dataService.updateProduct(req.params.id, req.body, adminUser);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await dataService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const existing = await dataService.getProductById(req.params.id, true);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updated = await dataService.updateProduct(req.params.id, {
      isActive: !existing.isActive
    }, req.admin?.name || 'Admin');

    res.json({
      success: true,
      message: `Product is now ${updated.isActive ? 'Active' : 'Inactive'}`,
      product: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle status' });
  }
};

