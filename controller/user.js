const passport = require("passport");
const User = require("../models/user.js");

module.exports.renderSignupForm =  (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password); // note that instead of newUser.save(), User.register(newUser, password) is used. To use 'passport' node module's features it is necessary to do so. .register(user, password) adds a new user to the User collection in mongoDB with hash and salt values corresponding to the password
        
        // to login user automatically after it's signup
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (e) {
        console.log(e)
        req.flash("error", e.message);
        res.redirect("/signup")
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.loginResponse = async (req, res) => {
    req.flash("success" ,"Welcome to Wanderlust! You are logged in!");
    res.redirect(res.locals.redirectUrl || "/listings");
}

module.exports.logout = (req, res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You're logged out!");
        res.redirect("/listings");
    });
};