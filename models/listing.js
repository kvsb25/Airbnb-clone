const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        filename:{
            type:String
        },
        url:{
            type: String,
            default: "https://unsplash.com/photos/a-palm-tree-with-a-blue-sky-in-the-background-qdiXVsVG7dY",
            set: (v) => v === "" ? "https://unsplash.com/photos/a-palm-tree-with-a-blue-sky-in-the-background-qdiXVsVG7dY" : v
        }
        
    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "review",
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
});

// Schema Middleware to handle deleting the reviews associated with a listing
listingSchema.post("findOneAndDelete", async (listing)=>{    // whenever Model.findByIdAndDelete(id) is called 'findOneAndDelete' middleware is triggered. The callback defines what to do when this middleware is triggered
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("listing", listingSchema);
module.exports = Listing;