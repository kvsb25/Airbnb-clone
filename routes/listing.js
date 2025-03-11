const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");  // for efficient error handling of async functions
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
    // Home/Index route
    .get(wrapAsync(listingController.index))
    //create route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing))

// New Route
router.get("/new", isLoggedIn, listingController.renderNewListingForm)

router.route("/:id")
    //show route
    // USED: mongoose, populate, populate nesting, connect-flash
    .get(wrapAsync(listingController.showListing))
    // update route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    //delete
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))

router.route("/:id/edit")
    //edit route
    .get(isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))


module.exports = router;
// Home/Index route
// router.get("/", wrapAsync(listingController.index));

//New Route
// router.get("/new", isLoggedIn, listingController.renderNewListingForm);

//show route
// USED: mongoose, populate, populate nesting, connect-flash
// router.get("/:id", wrapAsync(listingController.showListing));

//create route
// authorisation has been implemented by defining an owner of a listing
// router.post("/", validateListing, wrapAsync(listingController.createListing));

//edit route
// router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// update route
// router.put("/:id", isLoggedIn, isOwner, wrapAsync(listingController.updateListing));

// delete route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));
