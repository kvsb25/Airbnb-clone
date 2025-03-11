const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewListingForm = (req, res) => {
    res.render("listings/new.ejs");  // do not use /listings/new.ejs always use listings/new.ejs
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    // nesting populate to populate reviews and author inside it
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");  // populate function overwrites wherever ObjectId("id") (reference of an object of a mongoDB collection) with the object itself (the object it is referred to in ObjectId(id))
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    // let {title, description, image, price, country, location} = req.body;
    // let listing = req.body.listing;
    // new Listing(req.body.listing).save().then().catch((err)=>{console.log(err)}); // creating an object (document) of class Listing (model, collection) 
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Making user the owner of the listing it created
    newListing.image = {filename, url};
    await newListing.save();
    req.flash("success", "New Listing created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    // if listing was not found
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");  // incase there is an error, redirect to '/listing'
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // update image
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);  // Listing.findByIdAndDelete(id) trigger's the 'findOneAndDelete' middleware and it's callback (defined in "./models/listing.js"). It's callback deletes all the reviews associated with a listing. When Listing.findByIdAndDelete(id) is called it returns the listing object deleted to the middleware triggered using which the deleted listing's reviews can be accessed
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
}