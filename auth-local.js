const
    express = require('express'),
    passport = require('passport'),
    bcrypt = require('bcryptjs'),
    DB = require('./db'),
    LocalStrategy = require('passport-local').Strategy;


    
  
module.exports = function() {
    
    let router = express.Router();


    let db = new DB();

    passport.use(new LocalStrategy(
        function(userName, password, done) {
            
            // get addition
            db.select('users', {userName})
            .then(user => {
                user = user && user[0];
                if (!user) return done(null, false, {message: 'Unknown User'});
                let hash = user.userPassword;
                
                return new Promise((resolve, reject) => {
                        bcrypt.compare(password, hash, (err, isMatch) => (err? reject(err): resolve(isMatch)));
                    })
                    .then(isMatch=>{
                        if (isMatch) return done(null, user);
                        return done(null, false, {message: 'Invalid password'});
                    });
            })
            .catch(error=>done(error));
        }
    ));

 
    // Endpoint to login
    router.post('/login', passport.authenticate('local'), (req, res) => { 
        res.send(req.user); 
        
    });
    // router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

 
    // Register User
    // {name:'user', password:'1234'}
    router.post('/register', function(req, res) {
        let password = req.body.password;
        
        // makeHash
        new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (error, salt) => {
                if (error) return reject(error);
                bcrypt.hash(password, salt, (err, hash) => (err? reject(err): resolve(hash)));
            });
        })
        .then(hash => {
            return db.insert('users', {
                userName: req.body.name,
                userEmail: req.body.email||'',
                userPhone: req.body.phone||'',
                userPassword: hash
            });
        })
        .then(userId=>res.json({userId}).end())
        .catch(error=>res.status(500).json({error: error.message||error}).end());
    });

    
    return router;
}