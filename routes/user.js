const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/user.js");

router.get("/signup",userController.renderSignupForm);

// signup means to register a user in the database
    // USED: passport-local for user registeration, connect-flash, mongoDB 
router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.renderLoginForm);

// using passport.authenticate middleware to authenticate the login credentials, of the user, received from the login form as req.body
router.post(
    "/login",
    saveRedirectUrl,  // middleware to redirect the user (after loging in) to where he left before being redirected to the login page for authentication 
    // loging in using passport
    passport.authenticate("local", { 
        failureRedirect: '/login', 
        failureFlash: true 
    }),
    userController.loginResponse
);

// USED: req.logout
router.get("/logout", userController.logout);

module.exports = router;

// Registering a new user is equivalent to SignUp 