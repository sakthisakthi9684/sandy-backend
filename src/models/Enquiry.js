import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productDetails: {
    name: String,
    sku: String,
    price: Number,
    image: String
  },
  cartItems: [{
    productId: String,
    name: String,
    sku: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  quantity: {
    type: Number,
    default: 1
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  customerMessage: {
    type: String,
    default: ''
  },
  orderStatus: {
    type: String,
    enum: ['New', 'Contacted', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'New',
    index: true
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);

