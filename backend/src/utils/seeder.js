require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/luxefit');
  console.log('MongoDB connected for seeding');
};

const products = [
  {
    name: 'Classic Oxford Shirt',
    description: 'Premium cotton Oxford shirt with a relaxed fit. Perfect for casual Fridays or weekend outings. Features a button-down collar and chest pocket.',
    price: 1999, originalPrice: 2999, discount: 33,
    category: 'men', subCategory: 'Shirts', productType: 'Casual Shirts',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
    ],
    colorImages: {
      'White': [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600',
      ],
      'Blue': [
        'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600',
        'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600',
      ],
      'Gray': [
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
        'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600',
      ],
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Blue', 'Gray'],
    stock: 50, sku: 'LXF-MEN-001',
    tags: ['shirt', 'oxford', 'casual', 'men'],
    isFeatured: true, ratings: 4.5, numReviews: 128,
  },
  {
    name: 'Slim Fit Chinos',
    description: 'Modern slim-fit chinos crafted from stretch cotton blend. Versatile enough for the office or a night out.',
    price: 2499, originalPrice: 3499, discount: 29,
    category: 'men', subCategory: 'Trousers', productType: 'Chinos',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600',
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600',
    ],
    colorImages: {
      'Beige': [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600',
      ],
      'Navy': [
        'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
      ],
      'Olive': [
        'https://images.unsplash.com/photo-1490365827093-c7adda49eb67?w=600',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
      ],
    },
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Beige', 'Navy', 'Olive'],
    stock: 40, sku: 'LXF-MEN-002',
    tags: ['chinos', 'pants', 'slim', 'men'],
    isFeatured: true, ratings: 4.3, numReviews: 95,
  },
  {
    name: 'Graphic Printed T-Shirt',
    description: 'Trendy graphic printed t-shirt made from 100% combed cotton. Soft, breathable, and perfect for everyday casual wear.',
    price: 799, originalPrice: 1299, discount: 38,
    category: 'men', subCategory: 'T-Shirts', productType: 'Graphic T-Shirts',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c73?w=600',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
    ],
    colorImages: {
      'Black': [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      ],
      'White': [
        'https://images.unsplash.com/photo-1622445275463-afa2ab738c73?w=600',
        'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600',
      ],
      'Navy': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
      ],
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy'],
    stock: 120, sku: 'LXF-MEN-003',
    tags: ['tshirt', 'graphic', 'casual', 'printed'],
    isFeatured: true, isFlashSale: true, flashSalePrice: 599,
    ratings: 4.6, numReviews: 340,
  },
  {
    name: 'Polo T-Shirt Premium',
    description: 'Classic polo t-shirt with ribbed collar and cuffs. Made from premium pique cotton for a polished yet casual look.',
    price: 1199, originalPrice: 1799, discount: 33,
    category: 'men', subCategory: 'T-Shirts', productType: 'Polo T-Shirts',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1625910513089-cc6fb58ea8aa?w=600',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
    ],
    colorImages: {
      'Navy': [
        'https://images.unsplash.com/photo-1625910513089-cc6fb58ea8aa?w=600',
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600',
      ],
      'White': [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      ],
      'Red': [
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',
        'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600',
      ],
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'White', 'Red'],
    stock: 80, sku: 'LXF-MEN-004',
    tags: ['polo', 'tshirt', 'premium', 'casual'],
    isFeatured: true, ratings: 4.4, numReviews: 215,
  },
  {
    name: 'Floral Wrap Dress',
    description: 'Elegant floral wrap dress made from lightweight viscose. The adjustable tie waist creates a flattering silhouette.',
    price: 2999, originalPrice: 4499, discount: 33,
    category: 'women', subCategory: 'Dresses', productType: 'Wrap Dresses',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600',
    ],
    colorImages: {
      'Red': [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
      ],
      'Blue': [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
        'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600',
      ],
      'Pink': [
        'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600',
        'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
      ],
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Red', 'Blue', 'Pink'],
    stock: 35, sku: 'LXF-WMN-001',
    tags: ['dress', 'floral', 'wrap', 'women'],
    isFeatured: true, isFlashSale: true, flashSalePrice: 1999,
    ratings: 4.7, numReviews: 203,
  },
  {
    name: 'High-Waist Yoga Leggings',
    description: 'Ultra-soft high-waist leggings with 4-way stretch fabric. Features a hidden waistband pocket and moisture-wicking technology.',
    price: 1799, originalPrice: 2599, discount: 31,
    category: 'women', subCategory: 'Activewear', productType: 'Leggings',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
      'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600',
      'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600',
    ],
    colorImages: {
      'Black': [
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
        'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=600',
      ],
      'Navy': [
        'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
      ],
      'Burgundy': [
        'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=600',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600',
      ],
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Burgundy'],
    stock: 60, sku: 'LXF-WMN-002',
    tags: ['leggings', 'yoga', 'activewear', 'women'],
    isFlashSale: true, flashSalePrice: 1299,
    ratings: 4.8, numReviews: 512,
  },
  {
    name: "Boys' Graphic Tee Pack",
    description: "Fun graphic printed t-shirt for boys. Made from soft cotton. Available in bright colors kids love.",
    price: 599, originalPrice: 999, discount: 40,
    category: 'kids', subCategory: "Boys Clothing", productType: 'T-Shirts',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
      'https://images.unsplash.com/photo-1622290291165-c9dce34b8a0b?w=600',
    ],
    colorImages: {
      'Blue': [
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600',
      ],
      'Red': [
        'https://images.unsplash.com/photo-1622290291165-c9dce34b8a0b?w=600',
      ],
    },
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
    colors: ['Blue', 'Red'],
    stock: 90, sku: 'LXF-KID-001',
    tags: ['kids', 'boys', 'tshirt', 'graphic'],
    isFeatured: true, ratings: 4.5, numReviews: 87,
  },
  {
    name: 'Leather Shoulder Bag',
    description: 'Premium vegan leather shoulder bag with multiple compartments. Perfect for work or weekend outings.',
    price: 3499, originalPrice: 5999, discount: 42,
    category: 'accessories', subCategory: 'Bags', productType: 'Shoulder Bags',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600',
    ],
    colorImages: {
      'Black': [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600',
      ],
      'Brown': [
        'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
      ],
    },
    sizes: ['One Size'],
    colors: ['Black', 'Brown'],
    stock: 25, sku: 'LXF-ACC-001',
    tags: ['bag', 'leather', 'shoulder', 'accessories'],
    isFeatured: true, ratings: 4.6, numReviews: 178,
  },
  {
    name: 'Oversized Drop Shoulder Tee',
    description: 'Ultra-comfortable oversized t-shirt with drop shoulder design. A streetwear staple made from heavy 240 GSM cotton.',
    price: 999, originalPrice: 1499, discount: 33,
    category: 'men', subCategory: 'T-Shirts', productType: 'Oversized T-Shirts',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
      'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
      'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600',
    ],
    colorImages: {
      'White': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
      ],
      'Black': [
        'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
        'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600',
      ],
      'Beige': [
        'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600',
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=600',
      ],
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colors: ['White', 'Black', 'Beige'],
    stock: 150, sku: 'LXF-MEN-005',
    tags: ['oversized', 'tshirt', 'streetwear', 'drop-shoulder'],
    isFeatured: true, ratings: 4.7, numReviews: 429,
  },
  {
    name: 'Ethnic Kurta Set',
    description: 'Beautiful cotton kurta set with subtle embroidery. Perfect for festivals, family gatherings, and ethnic occasions.',
    price: 2799, originalPrice: 3999, discount: 30,
    category: 'men', subCategory: 'Ethnic Wear', productType: 'Kurta Sets',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1564596823821-79b27ffd0d5e?w=600',
      'https://images.unsplash.com/photo-1599842057874-37393e9342df?w=600',
    ],
    colorImages: {
      'White': [
        'https://images.unsplash.com/photo-1564596823821-79b27ffd0d5e?w=600',
      ],
      'Beige': [
        'https://images.unsplash.com/photo-1599842057874-37393e9342df?w=600',
      ],
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Beige'],
    stock: 45, sku: 'LXF-MEN-006',
    tags: ['kurta', 'ethnic', 'festival', 'men'],
    ratings: 4.5, numReviews: 93,
  },
  {
    name: 'Women Crop Top - Ribbed',
    description: 'Stylish ribbed crop top with a fitted silhouette. Perfect for pairing with high-waist jeans or skirts.',
    price: 699, originalPrice: 1099, discount: 36,
    category: 'women', subCategory: 'Tops', productType: 'Crop Tops',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600',
      'https://images.unsplash.com/photo-1562572159-4efd90232b96?w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
    ],
    colorImages: {
      'Black': [
        'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600',
        'https://images.unsplash.com/photo-1562572159-4efd90232b96?w=600',
      ],
      'White': [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
        'https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=600',
      ],
      'Pink': [
        'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600',
        'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
      ],
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Pink'],
    stock: 95, sku: 'LXF-WMN-003',
    tags: ['crop-top', 'ribbed', 'women', 'casual'],
    isFeatured: true, isFlashSale: true, flashSalePrice: 499,
    ratings: 4.5, numReviews: 267,
  },
  {
    name: 'Sports Running Shorts',
    description: 'Lightweight running shorts with built-in liner and side pockets. Moisture-wicking fabric keeps you dry during intense workouts.',
    price: 899, originalPrice: 1499, discount: 40,
    category: 'men', subCategory: 'Activewear', productType: 'Running Shorts',
    brand: 'LuxeFit',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600',
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600',
    ],
    colorImages: {
      'Black': ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=600'],
      'Navy': ['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600'],
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy'],
    stock: 70, sku: 'LXF-MEN-007',
    tags: ['shorts', 'running', 'sports', 'gym'],
    ratings: 4.3, numReviews: 145,
  },
];

const coupons = [
  { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderAmount: 500, maxDiscount: 200, isActive: true, expiresAt: new Date('2026-12-31') },
  { code: 'FLAT200', discountType: 'flat', discountValue: 200, minOrderAmount: 1000, isActive: true, expiresAt: new Date('2026-12-31') },
  { code: 'SUMMER20', discountType: 'percentage', discountValue: 20, minOrderAmount: 2000, maxDiscount: 500, isActive: true, expiresAt: new Date('2026-09-30') },
];

const seedDB = async () => {
  await connectDB();
  await User.deleteMany();
  await Product.deleteMany();
  await Coupon.deleteMany();

  const hashedPassword = await bcrypt.hash('admin123', 12);
  await User.create({
    name: 'Admin User', email: 'admin@luxefit.com',
    password: hashedPassword, role: 'admin', isVerified: true,
  });
  console.log('✅ Admin user created (admin@luxefit.com / admin123)');

  await User.create({
    name: 'John Doe', email: 'user@luxefit.com',
    password: hashedPassword, role: 'user', isVerified: true,
  });
  console.log('✅ Test user created (user@luxefit.com / admin123)');

  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded with colorImages`);

  await Coupon.insertMany(coupons);
  console.log('✅ Coupons seeded');

  mongoose.connection.close();
};

seedDB().catch(err => { console.error(err); process.exit(1); });
