const
    express = require('express'),
    passport = require('passport'),
    DB = require('./db'),
    FacebookStrategy = require('passport-facebook').Strategy;


FACEBOOK_CLIENT_ID = "123456789012345";
FACEBOOK_CLIENT_SECRET = "1234567890abcdef1234567890abcdef";
FACEBOOK_CALLBACK = '/auth/facebook/callback';

let db = new DB();

passport.use(new FacebookStrategy(
    {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:3000" + FACEBOOK_CALLBACK
    },
    function(accessToken, refreshToken, profile, done) { 
        console.log(profile) // http://www.passportjs.org/docs/profile/
    
        db.select('users', {facebookId: profile.id})
        .then(user=>{
            user = user && user[0];
            if (user) return done(null, user);
            
            // create new user
            user = {
                // https://developers.facebook.com/docs/messenger-platform/identity/user-profile/#fields
                // set all of the facebook information in our user model
                facebookId: profile.id,
                facebookToken: accessToken,
                userName: profile.displayName,
                email: profile.emails && profile.emails.length && profile.emails[0].value || ''
            };
            
            return db.insert('users', user)
                .then(res=>done(null, user));
        })
        .catch(done);
    }
));


module.exports = function() {
    
    let router = express.Router();
    
    router.get('/auth/facebook', passport.authenticate('facebook'));
    
    router.get(FACEBOOK_CALLBACK,
        passport.authenticate('facebook', { failureRedirect: '/login' }),
        function(req, res) {
            // Successful authentication, redirect home.
            console.log(req.user)
            res.redirect('/');
        }
    );
   
    return router;
}