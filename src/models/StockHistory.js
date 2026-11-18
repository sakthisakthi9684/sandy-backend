import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  productSku: {
    type: String,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  changeQuantity: {
    type: Number,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['restock', 'sale', 'adjustment', 'damaged', 'return'],
    default: 'adjustment'
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  adminUser: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

export const StockHistory = mongoose.models.StockHistory || mongoose.model('StockHistory', stockHistorySchema);

