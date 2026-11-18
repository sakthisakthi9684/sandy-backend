import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { StockHistory } from '../models/StockHistory.js';
import { Enquiry } from '../models/Enquiry.js';
import { WebsiteSettings } from '../models/WebsiteSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (name) => path.join(DATA_DIR, `${name}.json`);

const readJson = (name, fallback = []) => {
  const filePath = getFilePath(name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${name}.json:`, e);
    return fallback;
  }
};

const writeJson = (name, data) => {
  const filePath = getFilePath(name);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const isMongooseActive = () => mongoose.connection.readyState === 1;

// Helper to compute virtuals
const enrichProduct = (p) => {
  if (!p) return null;
  const original = Number(p.originalPrice) || 0;
  const selling = Number(p.sellingPrice) || 0;
  const discountPercentage = (original > selling && original > 0) 
    ? Math.round(((original - selling) / original) * 100) 
    : 0;

  let stockStatus = 'IN_STOCK';
  if (p.stockQuantity <= 0) stockStatus = 'OUT_OF_STOCK';
  else if (p.stockQuantity <= (p.lowStockThreshold || 5)) stockStatus = 'LOW_STOCK';

  return {
    ...p,
    _id: p._id ? p._id.toString() : String(Date.now()),
    discountPercentage,
    stockStatus
  };
};

export const dataService = {
  // --- AUTH / ADMIN ---
  async findAdminByEmail(email) {
    if (isMongooseActive()) {
      return Admin.findOne({ email: email.toLowerCase() });
    }
    const admins = readJson('admins');
    return admins.find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createAdmin(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    if (isMongooseActive()) {
      return Admin.create({ ...data, email: data.email.trim().toLowerCase(), password: hashedPassword });
    }
    const admins = readJson('admins');
    const normalizedEmail = data.email.trim().toLowerCase();
    if (admins.some(admin => admin.email.toLowerCase() === normalizedEmail)) {
      const error = new Error('Admin already exists');
      error.code = 'ADMIN_EXISTS';
      throw error;
    }
    const newAdmin = {
      _id: 'admin_' + Date.now(),
      name: data.name || 'Santhiya Admin',
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    admins.push(newAdmin);
    writeJson('admins', admins);
    return newAdmin;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // --- CATEGORIES ---
  async getCategories(onlyActive = false) {
    if (isMongooseActive()) {
      const filter = onlyActive ? { isActive: true } : {};
      return Category.find(filter).sort({ displayOrder: 1, name: 1 });
    }
    let list = readJson('categories');
    if (onlyActive) list = list.filter(c => c.isActive !== false);
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async getCategoryById(id) {
    if (isMongooseActive()) return Category.findById(id);
    const list = readJson('categories');
    return list.find(c => c._id === id || c.slug === id) || null;
  },

  async createCategory(data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (isMongooseActive()) {
      return Category.create({ ...data, slug });
    }
    const list = readJson('categories');
    const newCat = {
      _id: 'cat_' + Date.now(),
      name: data.name,
      slug,
      description: data.description || '',
      image: data.image || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: Number(data.displayOrder) || 0,
      createdAt: new Date().toISOString()
    };
    list.push(newCat);
    writeJson('categories', list);
    return newCat;
  },

  async updateCategory(id, data) {
    if (isMongooseActive()) {
      return Category.findByIdAndUpdate(id, data, { new: true });
    }
    const list = readJson('categories');
    const index = list.findIndex(c => c._id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...data, updatedAt: new Date().toISOString() };
    writeJson('categories', list);
    return list[index];
  },

  async deleteCategory(id) {
    if (isMongooseActive()) {
      return Category.findByIdAndDelete(id);
    }
    let list = readJson('categories');
    const removed = list.find(c => c._id === id);
    list = list.filter(c => c._id !== id);
    writeJson('categories', list);
    return removed;
  },

  // --- PRODUCTS ---
  async getProducts({
    category = '',
    search = '',
    minPrice = 0,
    maxPrice = Infinity,
    sortBy = 'newest',
    inStockOnly = false,
    featuredOnly = false,
    newArrivalOnly = false,
    bestSellerOnly = false,
    isAdmin = false,
    page = 1,
    limit = 50
  } = {}) {
    if (isMongooseActive()) {
      const query = {};
      if (!isAdmin) query.isActive = true;
      if (inStockOnly) query.stockQuantity = { $gt: 0 };
      if (featuredOnly) query.isFeatured = true;
      if (newArrivalOnly) query.isNewArrival = true;
      if (bestSellerOnly) query.isBestSeller = true;

      if (category && category !== 'All' && category !== 'all') {
        query.categoryName = new RegExp(`^${category}$`, 'i');
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { categoryName: { $regex: search, $options: 'i' } }
        ];
      }

      if (minPrice > 0 || (maxPrice < Infinity && maxPrice > 0)) {
        query.sellingPrice = {};
        if (minPrice > 0) query.sellingPrice.$gte = Number(minPrice);
        if (maxPrice > 0 && maxPrice < Infinity) query.sellingPrice.$lte = Number(maxPrice);
      }

      let sortObj = { createdAt: -1 };
      if (sortBy === 'price_asc') sortObj = { sellingPrice: 1 };
      else if (sortBy === 'price_desc') sortObj = { sellingPrice: -1 };
      else if (sortBy === 'name_asc') sortObj = { name: 1 };
      else if (sortBy === 'bestseller') sortObj = { isBestSeller: -1, createdAt: -1 };

      const projection = isAdmin ? {} : { purchasePrice: 0 };
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Product.find(query, projection).sort(sortObj).skip(skip).limit(limit),
        Product.countDocuments(query)
      ]);

      return {
        products: items.map(p => enrichProduct(p.toObject())),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    }

    // JSON fallback
    let list = readJson('products');
    if (!isAdmin) {
      list = list.filter(p => p.isActive !== false);
    }
    if (inStockOnly) {
      list = list.filter(p => p.stockQuantity > 0);
    }
    if (featuredOnly) {
      list = list.filter(p => p.isFeatured);
    }
    if (newArrivalOnly) {
      list = list.filter(p => p.isNewArrival);
    }
    if (bestSellerOnly) {
      list = list.filter(p => p.isBestSeller);
    }
    if (category && category !== 'All' && category !== 'all') {
      list = list.filter(p => (p.categoryName || '').toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.categoryName || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (minPrice > 0) {
      list = list.filter(p => p.sellingPrice >= minPrice);
    }
    if (maxPrice > 0 && maxPrice < Infinity) {
      list = list.filter(p => p.sellingPrice <= maxPrice);
    }

    // Sort
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'bestseller') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      products: paginated.map(p => {
        const enriched = enrichProduct(p);
        if (!isAdmin) delete enriched.purchasePrice;
        return enriched;
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getProductById(id, isAdmin = false) {
    if (isMongooseActive()) {
      const projection = isAdmin ? {} : { purchasePrice: 0 };
      const product = await Product.findById(id, projection);
      return product ? enrichProduct(product.toObject()) : null;
    }
    const list = readJson('products');
    const found = list.find(p => p._id === id || p.sku === id);
    if (!found) return null;
    const enriched = enrichProduct(found);
    if (!isAdmin) delete enriched.purchasePrice;
    return enriched;
  },

  async createProduct(data, adminUser = 'Admin') {
    const sku = data.sku || `SSS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const productPayload = {
      ...data,
      sku,
      sellingPrice: Number(data.sellingPrice),
      originalPrice: Number(data.originalPrice) || Number(data.sellingPrice),
      purchasePrice: Number(data.purchasePrice) || 0,
      stockQuantity: Math.max(0, Number(data.stockQuantity) || 0),
      lowStockThreshold: Number(data.lowStockThreshold) || 5,
      images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : [])
    };

    let saved;
    if (isMongooseActive()) {
      const doc = await Product.create(productPayload);
      saved = enrichProduct(doc.toObject());
    } else {
      const list = readJson('products');
      const newProduct = {
        _id: 'prod_' + Date.now(),
        ...productPayload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(newProduct);
      writeJson('products', list);
      saved = enrichProduct(newProduct);
    }

    // Record initial stock entry in StockHistory
    if (saved.stockQuantity > 0) {
      await this.recordStockMovement({
        product: saved._id,
        productName: saved.name,
        productSku: saved.sku,
        previousStock: 0,
        changeQuantity: saved.stockQuantity,
        currentStock: saved.stockQuantity,
        type: 'restock',
        reason: 'Initial Product Stock Entry',
        notes: 'Created with initial inventory',
        adminUser
      });
    }

    return saved;
  },

  async updateProduct(id, data, adminUser = 'Admin') {
    const existing = await this.getProductById(id, true);
    if (!existing) return null;

    const stockChanged = data.stockQuantity !== undefined && Number(data.stockQuantity) !== existing.stockQuantity;
    const prevStock = existing.stockQuantity;
    const newStock = stockChanged ? Math.max(0, Number(data.stockQuantity)) : prevStock;

    const payload = {
      ...data,
      stockQuantity: newStock,
      sellingPrice: data.sellingPrice !== undefined ? Number(data.sellingPrice) : existing.sellingPrice,
      originalPrice: data.originalPrice !== undefined ? Number(data.originalPrice) : existing.originalPrice,
      purchasePrice: data.purchasePrice !== undefined ? Number(data.purchasePrice) : existing.purchasePrice,
      updatedAt: new Date().toISOString()
    };

    let updated;
    if (isMongooseActive()) {
      const doc = await Product.findByIdAndUpdate(id, payload, { new: true });
      updated = enrichProduct(doc.toObject());
    } else {
      const list = readJson('products');
      const idx = list.findIndex(p => p._id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...payload };
      writeJson('products', list);
      updated = enrichProduct(list[idx]);
    }

    if (stockChanged) {
      await this.recordStockMovement({
        product: updated._id,
        productName: updated.name,
        productSku: updated.sku,
        previousStock: prevStock,
        changeQuantity: newStock - prevStock,
        currentStock: newStock,
        type: newStock > prevStock ? 'restock' : 'adjustment',
        reason: data.stockReason || 'Product Stock Updated in Catalog',
        notes: data.stockNotes || '',
        adminUser
      });
    }

    return updated;
  },

  async deleteProduct(id) {
    if (isMongooseActive()) {
      return Product.findByIdAndDelete(id);
    }
    let list = readJson('products');
    const removed = list.find(p => p._id === id);
    list = list.filter(p => p._id !== id);
    writeJson('products', list);
    return removed;
  },

  // --- INVENTORY & STOCK MANAGEMENT ---
  async adjustStock({ productId, type, quantity, reason, notes, adminUser = 'Admin' }) {
    const product = await this.getProductById(productId, true);
    if (!product) throw new Error('Product not found');

    const prevStock = Number(product.stockQuantity) || 0;
    const changeAmount = Number(quantity);
    let newStock = prevStock;

    if (type === 'restock' || type === 'add') {
      newStock = prevStock + Math.abs(changeAmount);
    } else if (type === 'reduce' || type === 'sale' || type === 'damaged') {
      newStock = Math.max(0, prevStock - Math.abs(changeAmount));
    } else if (type === 'set' || type === 'adjustment') {
      newStock = Math.max(0, changeAmount);
    }

    const actualChange = newStock - prevStock;

    // Update product stock
    await this.updateProduct(productId, {
      stockQuantity: newStock,
      stockReason: reason,
      stockNotes: notes
    }, adminUser);

    return {
      product: { ...product, stockQuantity: newStock },
      previousStock: prevStock,
      currentStock: newStock,
      changeQuantity: actualChange
    };
  },

  async recordStockMovement(entry) {
    if (isMongooseActive()) {
      return StockHistory.create(entry);
    }
    const list = readJson('stockHistory');
    const newEntry = {
      _id: 'stock_' + Date.now() + Math.random().toString(36).substring(2, 5),
      ...entry,
      createdAt: new Date().toISOString()
    };
    list.unshift(newEntry);
    writeJson('stockHistory', list);
    return newEntry;
  },

  async getStockHistory({ productId = '', limit = 100 } = {}) {
    if (isMongooseActive()) {
      const q = productId ? { product: productId } : {};
      return StockHistory.find(q).sort({ createdAt: -1 }).limit(limit);
    }
    let list = readJson('stockHistory');
    if (productId) {
      list = list.filter(h => h.product === productId);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.slice(0, limit);
  },

  // --- ENQUIRIES / ORDERS ---
  async createEnquiry(data) {
    if (isMongooseActive()) {
      return Enquiry.create(data);
    }
    const list = readJson('enquiries');
    const newEnquiry = {
      _id: 'enq_' + Date.now(),
      ...data,
      orderStatus: data.orderStatus || 'New',
      adminNotes: data.adminNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newEnquiry);
    writeJson('enquiries', list);
    return newEnquiry;
  },

  async getEnquiries({ status = '', search = '', limit = 100 } = {}) {
    if (isMongooseActive()) {
      const q = {};
      if (status && status !== 'All') q.orderStatus = status;
      if (search) {
        q.$or = [
          { customerName: { $regex: search, $options: 'i' } },
          { whatsappNumber: { $regex: search, $options: 'i' } }
        ];
      }
      return Enquiry.find(q).sort({ createdAt: -1 }).limit(limit);
    }
    let list = readJson('enquiries');
    if (status && status !== 'All') {
      list = list.filter(e => e.orderStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        (e.customerName || '').toLowerCase().includes(q) ||
        (e.whatsappNumber || '').includes(q)
      );
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list.slice(0, limit);
  },

  async updateEnquiryStatus(id, { orderStatus, adminNotes }) {
    if (isMongooseActive()) {
      const update = {};
      if (orderStatus) update.orderStatus = orderStatus;
      if (adminNotes !== undefined) update.adminNotes = adminNotes;
      return Enquiry.findByIdAndUpdate(id, update, { new: true });
    }
    const list = readJson('enquiries');
    const idx = list.findIndex(e => e._id === id);
    if (idx === -1) return null;
    if (orderStatus) list[idx].orderStatus = orderStatus;
    if (adminNotes !== undefined) list[idx].adminNotes = adminNotes;
    list[idx].updatedAt = new Date().toISOString();
    writeJson('enquiries', list);
    return list[idx];
  },

  // --- WEBSITE SETTINGS ---
  async getSettings() {
    if (isMongooseActive()) {
      let s = await WebsiteSettings.findOne();
      if (!s) {
        s = await WebsiteSettings.create({});
      }
      return s;
    }
    const list = readJson('settings', [{
      _id: 'settings_main',
      businessName: 'Santhiya Style Stone',
      tagline: 'Trendy • Elegant • Affordable',
      whatsappNumber: '919876543210',
      displayPhone: '+91 98765 43210',
      email: 'santhiyastylestone@gmail.com',
      address: 'Madurai & Chennai, Tamil Nadu, India',
      instagramUrl: 'https://www.instagram.com/santhiya_style_stone/',
      facebookUrl: 'https://facebook.com',
      announcementText: '✨ Festive Elegance Offer: Free Express Shipping Across India on Orders Above ₹999 | Direct WhatsApp Ordering Available',
      shippingInfo: 'Pan-India Express Shipping: Dispatched with insured high-security luxury packing. Delivered within 3-7 business days across all states.',
      aboutUsTitle: 'Santhiya Style Stone – Trendy • Elegant • Affordable Fashion Jewellery',
      aboutUsText: 'At Santhiya Style Stone, we believe every woman deserves to radiate confidence and royalty without an exorbitant price tag. Specializing in high-grade CZ, American Diamond, antique matte finish, temple jewellery, and daily wear elegance, each design is hand-selected for craftsmanship, sparkle, and longevity.',
      heroBanners: [
        {
          title: "Timeless Bridal & Festive Collections",
          subtitle: "Handpicked Royal Antique, Kundan & CZ Masterpieces",
          badge: "New Festive Arrivals",
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
          buttonText: "Explore Collections",
          buttonLink: "/collections"
        },
        {
          title: "Sparkling Everyday Glamour",
          subtitle: "Delicate Pendants, Stone Earrings & Designer Bangles",
          badge: "Trendy • Elegant • Affordable",
          image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80",
          buttonText: "Shop All Jewellery",
          buttonLink: "/shop"
        }
      ]
    }]);
    return list[0];
  },

  async updateSettings(data) {
    if (isMongooseActive()) {
      return WebsiteSettings.findOneAndUpdate({}, data, { new: true, upsert: true });
    }
    const current = await this.getSettings();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    writeJson('settings', [updated]);
    return updated;
  },

  // --- ADMIN ANALYTICS ---
  async getDashboardAnalytics() {
    const productsRes = await this.getProducts({ isAdmin: true, limit: 1000 });
    const allProducts = productsRes.products;
    const categories = await this.getCategories();
    const enquiries = await this.getEnquiries({ limit: 1000 });

    const totalProducts = allProducts.length;
    const totalCategories = categories.length;
    const totalStock = allProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
    const lowStockProducts = allProducts.filter(p => p.stockStatus === 'LOW_STOCK');
    const outOfStockProducts = allProducts.filter(p => p.stockStatus === 'OUT_OF_STOCK');
    const totalEnquiries = enquiries.length;
    const newEnquiries = enquiries.filter(e => e.orderStatus === 'New').length;

    // Total enquiry valuation
    const totalEnquiryValue = enquiries.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);

    return {
      totalProducts,
      totalCategories,
      totalStock,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalEnquiries,
      newEnquiries,
      totalEnquiryValue,
      lowStockItems: lowStockProducts.slice(0, 5),
      recentEnquiries: enquiries.slice(0, 6),
      recentProducts: allProducts.slice(0, 6)
    };
  }
};

