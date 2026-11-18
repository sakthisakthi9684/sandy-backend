import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const runSeed = async () => {
  console.log(' Seeding Santhiya Style Stone initial data...');

  // 1. Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admins = [
    {
      _id: 'admin_primary_001',
      name: 'Santhiya Admin',
      email: 'admin@santhiyastylestone.com',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'admins.json'), JSON.stringify(admins, null, 2));

  // 2. Categories
  const categories = [
    {
      _id: 'cat_necklace',
      name: 'Necklace Sets',
      slug: 'necklace-sets',
      description: 'Handcrafted royal chokers, multilayered haars, and delicate daily pendants.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 1
    },
    {
      _id: 'cat_earrings',
      name: 'Earrings & Jhumkas',
      slug: 'earrings-jhumkas',
      description: 'Sparkling AD stone studs, dramatic antique jhumkas, and graceful chandbalis.',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 2
    },
    {
      _id: 'cat_stone',
      name: 'Stone Jewellery',
      slug: 'stone-jewellery',
      description: 'High-clarity Cubic Zirconia, American Diamond, and colorful emerald/ruby doublet stones.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 3
    },
    {
      _id: 'cat_bangles',
      name: 'Bangles & Bracelets',
      slug: 'bangles-bracelets',
      description: 'Kada bangles, adjustable openable bracelets, and festive sound bangles in gold polish.',
      image: 'https://images.unsplash.com/photo-1611591475883-9b9643db8e3a?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 4
    },
    {
      _id: 'cat_bridal',
      name: 'Bridal Jewellery',
      slug: 'bridal-jewellery',
      description: 'Opulent bridal sets including mathapatti, choker, long haar, earrings & kamarbandh.',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 5
    },
    {
      _id: 'cat_rings',
      name: 'Rings',
      slug: 'rings',
      description: 'Statement cocktail rings, solitaire AD bands, and traditional floral designs.',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 6
    },
    {
      _id: 'cat_traditional',
      name: 'Traditional Temple Jewellery',
      slug: 'traditional-temple-jewellery',
      description: 'Kemp stones, Goddess Lakshmi motifs, and antique matte gold heritage craftsmanship.',
      image: 'https://images.unsplash.com/photo-1611591475850-24434ff6e52d?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 7
    },
    {
      _id: 'cat_combos',
      name: 'Combo Sets',
      slug: 'combo-sets',
      description: 'Curated value combos pairing matching necklaces, earrings, and bangles.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: 8
    }
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

  // 3. Products
  const products = [
    {
      _id: 'prod_sss_001',
      name: 'Royal Kundan & Pearl Choker Necklace Set',
      sku: 'SSS-NCK-1001',
      category: 'cat_necklace',
      categoryName: 'Necklace Sets',
      description: 'Exquisite regal choker crafted with hand-set Kundan stones, emerald green doublet drops, and lustrous micro-pearl clusters. Comes with matching statement drop earrings and maang tikka.',
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 950,
      sellingPrice: 1899,
      originalPrice: 2899,
      stockQuantity: 18,
      lowStockThreshold: 4,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      specifications: {
        material: 'Premium Brass & Copper Alloy',
        stoneType: 'Uncut Glass Kundan & Emerald Drops',
        plating: '22K Matte Micro Gold Plating',
        weight: '85 grams (Set)',
        occasion: 'Weddings, Engagements, Grand Receptions',
        careInstructions: 'Avoid direct perfume spray. Keep in ziplock after wiping with soft cotton cloth.',
        packaging: 'Velvet Lined Signature Jewellery Box'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
    },
    {
      _id: 'prod_sss_002',
      name: 'Emerald Green American Diamond Bridal Set',
      sku: 'SSS-BRD-1002',
      category: 'cat_bridal',
      categoryName: 'Bridal Jewellery',
      description: 'Breathtaking luxury bridal necklace laden with AAA+ grade Cubic Zirconia diamonds and vivid Colombian emerald doublet stones. Radiates real diamond brilliance.',
      images: [
        'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 1800,
      sellingPrice: 3499,
      originalPrice: 4999,
      stockQuantity: 8,
      lowStockThreshold: 3,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      specifications: {
        material: 'High-Density Silver Alloy Base',
        stoneType: 'AAA+ Swiss Cut Cubic Zirconia & Hydro Emeralds',
        plating: 'Rhodium & Rose Gold Dual Tone',
        weight: '110 grams',
        occasion: 'Bridal, Sangeet, High-End Soirees',
        careInstructions: 'Store separately to prevent scratches. Clean with micro-fiber cloth.',
        packaging: 'Luxury Hardcase Velvet Gift Box'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    },
    {
      _id: 'prod_sss_003',
      name: 'Antique Matte Gold Peacock Jhumkas',
      sku: 'SSS-EAR-1003',
      category: 'cat_earrings',
      categoryName: 'Earrings & Jhumkas',
      description: 'Intricately carved temple jhumkas featuring dancing peacock motifs, rubellite pink stones, and cascading golden micro-beads. Ultra light and comfortable for all-day wear.',
      images: [
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 320,
      sellingPrice: 799,
      originalPrice: 1299,
      stockQuantity: 24,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      specifications: {
        material: 'Copper Alloy',
        stoneType: 'Synthetic Ruby & Kempu Stones',
        plating: 'Antique Matte Gold',
        weight: '28 grams (pair)',
        occasion: 'Festivals, Temple Visits, Ethnic Functions',
        careInstructions: 'Keep dry. Do not immerse in water or chemical cleansers.',
        packaging: 'Velvet Pouch'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      _id: 'prod_sss_004',
      name: 'Sparkling AD Solitaire Cocktail Ring',
      sku: 'SSS-RNG-1004',
      category: 'cat_rings',
      categoryName: 'Rings',
      description: 'Statement adjustable cocktail ring adorned with a brilliant cushion-cut center stone encircled by a double halo of glistening American diamonds. Fits any finger size.',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 220,
      sellingPrice: 599,
      originalPrice: 999,
      stockQuantity: 15,
      lowStockThreshold: 4,
      isActive: true,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      specifications: {
        material: 'Lead & Nickel Free Alloy',
        stoneType: 'Hearts & Arrows Cut Cubic Zirconia',
        plating: 'White Rhodium Diamond Polish',
        weight: '12 grams',
        occasion: 'Cocktails, Date Nights, Modern Ethnic',
        careInstructions: 'Wipe with soft cloth after usage.',
        packaging: 'Premium Ring Presentation Box'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
    },
    {
      _id: 'prod_sss_005',
      name: 'Rose Gold Openable CZ Kada Bangles (Pair)',
      sku: 'SSS-BNG-1005',
      category: 'cat_bangles',
      categoryName: 'Bangles & Bracelets',
      description: 'Stunning pair of openable kada bangles finished in sleek rose gold with alternating baguette and round zircon stones. Secure side clasp mechanism for effortless wearing.',
      images: [
        'https://images.unsplash.com/photo-1611591475883-9b9643db8e3a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 650,
      sellingPrice: 1499,
      originalPrice: 2299,
      stockQuantity: 6,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      specifications: {
        material: 'High Grade Brass',
        stoneType: 'Micro-Pave Cubic Zirconia',
        plating: '18K Rose Gold Flash Plating',
        weight: '44 grams (Pair)',
        occasion: 'Festivals, Office Wear, Family Celebrations',
        careInstructions: 'Avoid soap lather and sweat exposure.',
        packaging: 'Luxury Bangle Box'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    },
    {
      _id: 'prod_sss_006',
      name: 'Temple Goddess Lakshmi Kasu Mala Long Haar',
      sku: 'SSS-TMP-1006',
      category: 'cat_traditional',
      categoryName: 'Traditional Temple Jewellery',
      description: 'Traditional South Indian coin haar (Kasu Mala) embossed with auspicious Goddess Lakshmi motifs, flanked by ruby red stones and pearl hangings. Perfect for bridal pattu sarees.',
      images: [
        'https://images.unsplash.com/photo-1611591475850-24434ff6e52d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 1200,
      sellingPrice: 2399,
      originalPrice: 3599,
      stockQuantity: 3,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      specifications: {
        material: 'Pure Copper Alloy Base',
        stoneType: 'Traditional Kempu Pink & Green Stones',
        plating: 'South Indian Antique Matte Gold',
        weight: '92 grams',
        occasion: 'Temple Weddings, Pujas, Bharatanatyam, Diwali',
        careInstructions: 'Preserve in velvet pouch with silica gel packet.',
        packaging: 'Royal Red Velvet Box'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
    },
    {
      _id: 'prod_sss_007',
      name: 'Ruby & Pearl Designer Festive Combo Set',
      sku: 'SSS-CMB-1007',
      category: 'cat_combos',
      categoryName: 'Combo Sets',
      description: 'Value gift combo featuring matching multilayered pearl necklace, matching chandelier earrings, and a free adjustable floral ring. An all-in-one festive look at an unbeatable price.',
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 850,
      sellingPrice: 1799,
      originalPrice: 2999,
      stockQuantity: 12,
      lowStockThreshold: 4,
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      specifications: {
        material: 'Premium Brass Base',
        stoneType: 'Hydro Rubies, AD Stones & Fresh Shell Pearls',
        plating: 'High Micron Gold Plating',
        weight: '75 grams total',
        occasion: 'Festivals, Family Gatherings, Gifting',
        careInstructions: 'Store pieces separately in soft compartments.',
        packaging: 'Complete 3-in-1 Presentation Gift Box'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
    },
    {
      _id: 'prod_sss_008',
      name: 'Minimalist Diamond Droplet Pendant & Studs',
      sku: 'SSS-STN-1008',
      category: 'cat_stone',
      categoryName: 'Stone Jewellery',
      description: 'Understated elegance for modern wear. Pear-cut Austrian crystal droplet pendant on a delicate rose gold link chain, accompanied by matching droplet studs.',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
      ],
      purchasePrice: 280,
      sellingPrice: 699,
      originalPrice: 1099,
      stockQuantity: 0,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      specifications: {
        material: 'Skin-friendly Stainless Steel & Brass',
        stoneType: 'Austrian Crystals',
        plating: 'Rose Gold PVD Coating (Anti-Tarnish)',
        weight: '16 grams',
        occasion: 'Daily Wear, Casual Brunches, College, Work',
        careInstructions: 'Water-resistant. Keep dry when swimming or bathing.',
        packaging: 'Eco-friendly Jewellery Card & Satin Pouch'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
    }
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2));

  // 4. Stock History
  const stockHistory = [
    {
      _id: 'stk_001',
      product: 'prod_sss_001',
      productName: 'Royal Kundan & Pearl Choker Necklace Set',
      productSku: 'SSS-NCK-1001',
      previousStock: 0,
      changeQuantity: 20,
      currentStock: 20,
      type: 'restock',
      reason: 'Batch Restock from Artisan Workshop',
      notes: 'Initial festival lot received and quality checked',
      adminUser: 'Santhiya Admin',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
    },
    {
      _id: 'stk_002',
      product: 'prod_sss_001',
      productName: 'Royal Kundan & Pearl Choker Necklace Set',
      productSku: 'SSS-NCK-1001',
      previousStock: 20,
      changeQuantity: -2,
      currentStock: 18,
      type: 'sale',
      reason: 'WhatsApp Direct Order dispatch',
      notes: 'Order #WH-9844 dispatched to Coimbatore',
      adminUser: 'Santhiya Admin',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    },
    {
      _id: 'stk_003',
      product: 'prod_sss_006',
      productName: 'Temple Goddess Lakshmi Kasu Mala Long Haar',
      productSku: 'SSS-TMP-1006',
      previousStock: 5,
      changeQuantity: -2,
      currentStock: 3,
      type: 'sale',
      reason: 'Wedding Order Fulfilled',
      notes: 'Dispatched to Madurai customer',
      adminUser: 'Santhiya Admin',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      _id: 'stk_004',
      product: 'prod_sss_008',
      productName: 'Minimalist Diamond Droplet Pendant & Studs',
      productSku: 'SSS-STN-1008',
      previousStock: 4,
      changeQuantity: -4,
      currentStock: 0,
      type: 'sale',
      reason: 'Sold out via WhatsApp Flash Sale',
      notes: 'Awaiting supplier restock lot',
      adminUser: 'Santhiya Admin',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    }
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'stockHistory.json'), JSON.stringify(stockHistory, null, 2));

  // 5. Enquiries
  const enquiries = [
    {
      _id: 'enq_001',
      customerName: 'Priya Sundaram',
      whatsappNumber: '9840123456',
      email: 'priya.s@gmail.com',
      city: 'Chennai',
      address: 'Anna Nagar, Chennai, Tamil Nadu',
      product: 'prod_sss_001',
      productDetails: {
        name: 'Royal Kundan & Pearl Choker Necklace Set',
        sku: 'SSS-NCK-1001',
        price: 1899,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
      },
      cartItems: [],
      quantity: 1,
      totalAmount: 1899,
      customerMessage: 'Looking for fast delivery for engagement next week. Can you share real video on WhatsApp?',
      orderStatus: 'Contacted',
      adminNotes: 'Shared WhatsApp video. Customer confirmed, waiting for payment screenshot.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
    },
    {
      _id: 'enq_002',
      customerName: 'Kavitha Ramachandran',
      whatsappNumber: '9789012345',
      email: 'kavitha.ram@outlook.com',
      city: 'Madurai',
      address: 'KK Nagar, Madurai, Tamil Nadu',
      product: 'prod_sss_002',
      productDetails: {
        name: 'Emerald Green American Diamond Bridal Set',
        sku: 'SSS-BRD-1002',
        price: 3499,
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80'
      },
      cartItems: [],
      quantity: 1,
      totalAmount: 3499,
      customerMessage: 'Interested in this emerald bridal set for my wedding reception. Is cod available?',
      orderStatus: 'New',
      adminNotes: 'New WhatsApp lead from Instagram profile.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
    },
    {
      _id: 'enq_003',
      customerName: 'Divya Bharathi',
      whatsappNumber: '9655123987',
      email: 'divya.b@yahoo.com',
      city: 'Bangalore',
      address: 'Indiranagar, Bangalore, Karnataka',
      product: 'prod_sss_007',
      productDetails: {
        name: 'Ruby & Pearl Designer Festive Combo Set',
        sku: 'SSS-CMB-1007',
        price: 1799,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
      },
      cartItems: [],
      quantity: 2,
      totalAmount: 3598,
      customerMessage: 'Ordered 2 sets for Diwali gifting. Dispatched via DTDC.',
      orderStatus: 'Shipped',
      adminNotes: 'Tracking ID DTDC492023 shared on WhatsApp.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'enquiries.json'), JSON.stringify(enquiries, null, 2));

  // 6. Settings
  const settings = [
    {
      _id: 'settings_main',
      businessName: 'Santhiya Style Stone',
      tagline: 'Trendy • Elegant • Affordable',
      whatsappNumber: '919876543210',
      displayPhone: '+91 98765 43210',
      email: 'santhiyastylestone@gmail.com',
      address: 'Madurai & Chennai, Tamil Nadu, India',
      instagramUrl: 'https://www.instagram.com/santhiya_style_stone/',
      facebookUrl: 'https://facebook.com/santhiyastylestone',
      announcementText: '✨ Festive Elegance Offer: Free Express Shipping Across India on Orders Above ₹999 | Direct WhatsApp Ordering Available',
      shippingInfo: 'Pan-India Express Shipping: Dispatched with insured high-security luxury packing. Delivered within 3-7 business days across all states.',
      aboutUsTitle: 'Santhiya Style Stone – Trendy • Elegant • Affordable Fashion Jewellery',
      aboutUsText: 'At Santhiya Style Stone, we believe every woman deserves to radiate confidence and royalty without an exorbitant price tag. Specializing in high-grade CZ, American Diamond, antique matte finish, temple jewellery, and daily wear elegance, each design is hand-selected for craftsmanship, sparkle, and longevity.',
      heroBanners: [
        {
          title: 'Timeless Bridal & Festive Collections',
          subtitle: 'Handpicked Royal Antique, Kundan & CZ Masterpieces',
          badge: 'New Festive Arrivals',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80',
          buttonText: 'Explore Collections',
          buttonLink: '/collections'
        },
        {
          title: 'Sparkling Everyday Glamour',
          subtitle: 'Delicate Pendants, Stone Earrings & Designer Bangles',
          badge: 'Trendy • Elegant • Affordable',
          image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80',
          buttonText: 'Shop All Jewellery',
          buttonLink: '/shop'
        }
      ]
    }
  ];
  fs.writeFileSync(path.join(DATA_DIR, 'settings.json'), JSON.stringify(settings, null, 2));

  console.log('✅ Santhiya Style Stone data seeded successfully!');
};

// If run directly via node src/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

