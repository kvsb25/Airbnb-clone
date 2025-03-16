if(process.env.NODE_ENV != "production"){
  require("dotenv").config();  // dotenv module is to access keys in dotenv
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");  // to make PUT, DELETE https requests
const ejsMate = require("ejs-mate");  // to use 'layout()' in ejs for common layouts
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

main().then(() => { console.log("connected to database") }).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("view engine", "ejs");  // to render ejs
app.set("views", path.join(__dirname, "views"));  // to make the compiler look for view folder whenever .ejs file is mentioned
app.use(express.urlencoded({ extended: true }));  // to parse URL encoded format to javascript object
app.use(methodOverride("_method"));  // to override POST and GET requests
app.engine("ejs", ejsMate);  // to use ejsMate for ejs layout
app.use(/*"/public",*/ express.static(path.join(__dirname, "/public")));  // look for static files in public folder

const sessionOptions = {
  secret: "mysupersecretcode",  // to make the cookies signed
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
}

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// using session middleware to create a session with client
app.use(session(sessionOptions));
// using flash middleware to enable creation of flash messages
app.use(flash());


/*---------------------- PASSPORT ------------------------- */

// using passport middlewares for user authentication
app.use(passport.initialize());
app.use(passport.session()); // a web application needs the ability to identify users as they browse from page to page. This series of requests and responses, each associated with the same user, is known as a session
passport.use(new LocalStrategy(User.authenticate())); // declaring the passport strategy and function we are going to use for user authentication. Strategy = Local Strategy, Function = 

passport.serializeUser(User.serializeUser()); // storing user related data into the session storage when a session starts
passport.deserializeUser(User.deserializeUser()); // write definitions of both serializing and deserializing user

/*--------------------------------------------------------- */

// middleware to store variables in res.local ( like success and error flash messages (from success and error message array)) for rendering and easy templating in ejs
app.use((req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; // req.user == undefined if user is not logged in. passport.authenticate() creates a user object in req object
  next();
});

app.get("/demouser", async (req, res)=>{
  let fakeUser = new User({
    email: "fake@gmai.com",
    username: "fakeUser",
  });

  let registeredUser = await User.register(fakeUser, "helloworld"); //register(user, password, cb) Convenience method to register a new user instance with a given password. Also checks if username is unique  
  // pbkdf2 hashing algorithm is used
  res.send(registeredUser);
})

/*----------------------------ROUTING----------------------------*/

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

/*--------------------------------------------------------------*/

// app.get("/testListing",async (req,res)=>{
//   let sampleListing = new Listing({
//     title:"My new Villa",
//     description:"By the beach",
//     price: 120000,
//     location: "Calungute, Goa",
//     country: "India"
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// })

// handler for all routes. If server reaches here for searching a route that means the page doesn't exist because if page existed the above mentioned handlers would have already sent a response and complete the client-server response cycle
app.all('*', (req, res, next) => {
  console.log(req.originalUrl);
  next(new ExpressError(404, "Page Not Found!"));
})

// error handling middleware: if an error is caught it is handled by this middleware
app.use((err, req, res, next) => {
  console.log(err);
  let { statusCode = 500, message = "server side error" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { err, statusCode });
});

app.listen(8080, () => { console.log("Listening at port 8080") });