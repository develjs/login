/**
 * 
 */
const 
    express = require('express'),
    session = require('express-session'),
    passport = require('passport'),
    HTTPStatus = require('http-status'),
    DB = require('./db'),
    
    local = require('./auth-local'),
    facebook = require('./auth-facebook');



module.exports = function() {
    
    let router = express.Router();
    let db = new DB();
    
    
    const SESSOIN_SECRET = 'secret';
    
    // Express Session
    router.use(session({
        secret: SESSOIN_SECRET,
        resave: true,
        rolling: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 10 * 60 * 1000,
            httpOnly: false,
        }
    }));
    
    // Passport init
    router.use(passport.initialize());
    router.use(passport.session());
    
    passport.serializeUser(function(user, done) {
        done(null, user.userId);
    });

    passport.deserializeUser(function(userId, done) {
        db.select('users', {userId})
        .then(user=>done(null, user && user[0]))
        .catch(done);
    });
    
    // must be before non-authenticated code
    router.use(local());
    router.use(facebook());
    
    
    // mustAuthenticated
    router.use((req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(HTTPStatus.UNAUTHORIZED).send({});
        }
        next();
    })

    // Endpoint to get current user
    router.get('/user', (req, res) => {
        res.send(req.user);
    })

    // Endpoint to logout
    router.get('/logout', (req, res) => {
        req.logout();
        res.send({})
    });
    


    return router;
};
