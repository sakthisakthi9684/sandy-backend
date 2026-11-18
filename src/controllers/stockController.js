import { dataService } from '../services/dataService.js';

export const adjustStock = async (req, res) => {
  try {
    const { productId, type, quantity, reason, notes } = req.body;

    if (!productId || quantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, quantity, and adjustment reason are required.'
      });
    }

    const adminUser = req.admin?.name || 'Admin';
    const result = await dataService.adjustStock({
      productId,
      type: type || 'adjustment',
      quantity: Number(quantity),
      reason,
      notes: notes || '',
      adminUser
    });

    res.json({
      success: true,
      message: 'Stock updated successfully and recorded in inventory history.',
      data: result
    });
  } catch (error) {
    console.error('Stock adjustment error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to adjust stock' });
  }
};

export const getStockHistory = async (req, res) => {
  try {
    const { productId, limit } = req.query;
    const history = await dataService.getStockHistory({
      productId,
      limit: Number(limit) || 100
    });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve stock history' });
  }
};

export const getStockAlerts = async (req, res) => {
  try {
    const productsRes = await dataService.getProducts({ isAdmin: true, limit: 1000 });
    const all = productsRes.products;

    const lowStock = all.filter(p => p.stockStatus === 'LOW_STOCK');
    const outOfStock = all.filter(p => p.stockStatus === 'OUT_OF_STOCK');

    res.json({
      success: true,
      summary: {
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        totalTracked: all.length
      },
      lowStock,
      outOfStock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stock alerts' });
  }
};

