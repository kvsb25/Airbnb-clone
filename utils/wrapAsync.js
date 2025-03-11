module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

// to prevent use of try-catch block in every async function, wrapAsync can be used
// for effective error handling of async functions

// function wrapAsync(fn){
//     return function (req, res, next){
//         fn(req, res, next).catch(err=>next(err));
//     }
// }