import mongoose from 'mongoose';

const websiteSettingsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    default: 'Santhiya Style Stone'
  },
  tagline: {
    type: String,
    default: 'Trendy • Elegant • Affordable'
  },
  whatsappNumber: {
    type: String,
    default: '919876543210'
  },
  displayPhone: {
    type: String,
    default: '+91 98765 43210'
  },
  email: {
    type: String,
    default: 'santhiyastylestone@gmail.com'
  },
  address: {
    type: String,
    default: 'Madurai & Chennai, Tamil Nadu, India'
  },
  instagramUrl: {
    type: String,
    default: 'https://www.instagram.com/santhiya_style_stone/'
  },
  facebookUrl: {
    type: String,
    default: 'https://facebook.com'
  },
  announcementText: {
    type: String,
    default: '✨ Special Festive Offer: Free Express Shipping Across India on Orders Above ₹999 | Direct WhatsApp Ordering Available'
  },
  shippingInfo: {
    type: String,
    default: 'Pan-India Delivery: Fast & insured courier dispatch within 24-48 hours. Safe, tamper-proof luxury packaging to guarantee perfection.'
  },
  aboutUsTitle: {
    type: String,
    default: 'Santhiya Style Stone – Trendy • Elegant • Affordable Fashion Jewellery'
  },
  aboutUsText: {
    type: String,
    default: 'At Santhiya Style Stone, we believe every woman deserves to radiate confidence and royalty without an exorbitant price tag. Specializing in high-grade CZ, American Diamond, antique matte finish, temple jewellery, and daily wear elegance, each design is hand-selected for craftsmanship, sparkle, and longevity.'
  },
  heroBanners: [{
    title: String,
    subtitle: String,
    badge: String,
    image: String,
    buttonText: String,
    buttonLink: String
  }]
}, {
  timestamps: true
});

export const WebsiteSettings = mongoose.models.WebsiteSettings || mongoose.model('WebsiteSettings', websiteSettingsSchema);

