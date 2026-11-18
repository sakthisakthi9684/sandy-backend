import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
    index: true
  },
  categoryName: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  purchasePrice: {
    type: Number,
    default: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isNewArrival: {
    type: Boolean,
    default: false,
    index: true
  },
  isBestSeller: {
    type: Boolean,
    default: false,
    index: true
  },
  specifications: {
    material: { type: String, default: 'High Grade Brass / Copper Alloy' },
    stoneType: { type: String, default: 'Cubic Zirconia / AD Stones / Kundan' },
    plating: { type: String, default: 'Premium Gold / Rose Gold Polish' },
    weight: { type: String, default: 'Lightweight & Comfortable' },
    occasion: { type: String, default: 'Weddings, Festivals, Parties, Everyday Elegance' },
    careInstructions: { type: String, default: 'Keep away from moisture, perfumes and chemicals. Store in airtight zip lock pouches.' },
    packaging: { type: String, default: 'Signature Santhiya Style Stone Luxury Velvet Pouch Box' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual discount percentage calculation
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.sellingPrice) {
    return Math.round(((this.originalPrice - this.sellingPrice) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity <= 0) return 'OUT_OF_STOCK';
  if (this.stockQuantity <= this.lowStockThreshold) return 'LOW_STOCK';
  return 'IN_STOCK';
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

