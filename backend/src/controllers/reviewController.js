const Review = require('../models/Review');
const Product = require('../models/Product');

exports.getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, reviews });
};

exports.createReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const existingReview = await Review.findOne({ user: req.user._id, product: req.params.productId });
  if (existingReview)
    return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

  const review = await Review.create({
    user: req.user._id,
    product: req.params.productId,
    rating,
    title,
    comment,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
};

exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  await review.deleteOne();
  await Review.calcAverageRating(review.product);
  res.json({ success: true, message: 'Review deleted' });
};
