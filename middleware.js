const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");   // joi schema for server side schema and data validation
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    try{//console.log(req.user); // printing the details of the user logged in. req.user comes with passport module
    // req.user returns undefined if there is no authentic user logged-in in a session. returns an object (with user's information) if a user is logged-in

    if (!req.isAuthenticated()) { // isAuthenticated() method comes with passport module. isAuthenticated() method returns true if the client in a session is logged in. False, if the client is not logged in
        
        // storing req.originalUrl in session
        req.session.redirectUrl = req.originalUrl; // req.originalUrl has the full Url/path being handled by the express.js server at a moment.
        // [NOTE: req.originalUrl is the url where the user has to be redirected after it is logged in using ([PUT], '/login'). So when 'isLoggedIn' middleware is called for routes which require user to be logged-in, if the user is not authenticated(logged-in) then it that case the user will be redirected to '/login' and we want the user to be redirected back to the page where he was before being redirected to the '/login' page after logging in. This is the reason why req.original is being accessed in 'isLoggedIn' which is used as a middleware for routes where user is needed to be authenticated]
            
        req.flash("error", "you must be logged in");
        return res.redirect("/login");
    }
    next(); // if and only if next() is called then the next middleware will be called. As in the if statement above there is no next() called so the next middleware will not be called
    }
    catch(err){
        next(err);
    }
}

module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl; // storing req.session.redirectUrl to res.locals.redirectUrl, if req.session.redirectUrl exists, so that it is accessible anywhere by the means of res.locals as the function passport.authenticate() refreshes req.session whenever it's execution completes
    }
    next();
}

module.exports.isOwner = async (req, res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("owner");
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to take this action");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// Middleware for server side data validation of listing. Validating the data recieved in req.body with the pre-defined listing schema 'listingSchema' made with npm 'Joi'
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

// Middleware for server side data validation of review
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId).populate("author");
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to take this action");
        return res.redirect(`/listings/${id}`);
    }
    next();
}