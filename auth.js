/**
 * 
 */
const 
    express = require('express'),
    HTTPStatus = require('http-status'),
    DB = require('./db'),
    
    local = require('./auth-local'),
    facebook = require('./auth-facebook')
    jwt = require('./auth-jwt');



module.exports = function() {
    
    let router = express.Router();
    let db = new DB();
    
    
    // must be before non-authenticated code
    router.use(local());
    router.use(facebook());
    router.use(jwt()); // do it after other sessions
    
    
    // login manual handling
    router.post('/login', function (req, res, next) {
        return res.json({user: req.user});
    })
    
    
    // check is authenticated
    router.use((req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(HTTPStatus.UNAUTHORIZED).send({});
        }
        
        next();
    })

    // -------------------

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
