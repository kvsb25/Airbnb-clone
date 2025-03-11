const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controller/review.js");

//Post review Route
// (/listings/:id/review)
    // USED: review Authorisation, pushing review to listing.reviews, connect-flash(success)
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete review Route
// (/listings/:id/review/:reviewId)
    // USED: $pull mongoDB operator
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;