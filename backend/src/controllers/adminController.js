const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders, totalUsers, totalProducts,
    monthOrders, lastMonthOrders,
    monthRevenue, lastMonthRevenue,
    recentOrders, topProducts,
    ordersByStatus, revenueByMonth
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const currentRevenue = monthRevenue[0]?.total || 0;
  const previousRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = previousRevenue > 0
    ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
    : 100;
  const orderGrowth = lastMonthOrders > 0
    ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
    : 100;

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalUsers,
      totalProducts,
      monthOrders,
      currentRevenue,
      revenueGrowth: Number(revenueGrowth),
      orderGrowth: Number(orderGrowth),
    },
    recentOrders,
    topProducts,
    ordersByStatus,
    revenueByMonth,
  });
};
