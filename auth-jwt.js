
const 
    express = require('express'),
    passport = require('passport'),
    passportJWT = require("passport-jwt"),
    JWTStrategy   = passportJWT.Strategy,
    // ExtractJWT = passportJWT.ExtractJwt,
    jwt = require('jsonwebtoken');

const 
    JWT_KEY = 'your_jwt_secret',
    COOKIE_NAME = 'jwt';
    // JWT_ISSUER = 'accounts.examplesoft.com';
    // JWT_AUDIENCE = 'yoursite.net';


module.exports = function() {
    let router = express.Router();

    passport.use(new JWTStrategy({
        // jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        jwtFromRequest: req => req.cookies && req.cookies[COOKIE_NAME],
        secretOrKey: JWT_KEY
        //issuer: JWT_ISSUER,
        //audience: JWT_AUDIENCE
    },
    (payload, done) => {
        done(null, payload);
    }));
    
    
    // save jwt token to cookie, do it after login types
    router.post('/login', function (req, res, next) {
        if (req.user) { 
            let user = {
                userId: req.user.userId, 
                userName: req.user.userName, 
                userRole: req.user.userRole
            }
            
            let token = jwt.sign(user, JWT_KEY);
            res.cookie(COOKIE_NAME, token);
            req.cookies[COOKIE_NAME] = token; // rewrite old token
            
            next()
        }
    });
    
    router.use(passport.authenticate('jwt', {session: false})); // apply jwt session if able
    
    return router;
}
