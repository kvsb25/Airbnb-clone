const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;  // declaring and storing the author of the review
    listing.reviews.push(newReview);  // adding the review to it's listing in database 
    
    await newReview.save(); // saving the changes
    await listing.save(); // saving the changes
    
    req.flash("success", "New Review created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // $pull is a mongoDB operator used to remove, from an existing array, all instances of a value or values that match a specified condition
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
};