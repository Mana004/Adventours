const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

//const catchAsync = require('../utils/catchAsync');

//getAllReviews prev code
// catchAsync(async (req, res, next) => {
//   let filter = {};

//   if (req.params.tourId) {
//     filter = { tour: req.params.tourId };
//   }
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     dats: {
//       reviews,
//     },
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
