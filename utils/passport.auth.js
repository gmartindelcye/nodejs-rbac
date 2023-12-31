const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user.model');

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async(email, password, done) => {
        try {
            const user = await User.findOne({ email });
            // Username/email not found
            if (!user) {
                return done(null, false, { message: 'Incorrect username/password.' });
            }
            // Email found and need to check password
            const isMatch = await user.isValidPassword(password);
            return isMatch ? done(null, user) : done(null, false, { message: 'Incorrect username/password.' });
        } catch (error) {
            done(error);
        }

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// passport.deserializeUser(function(id, done) {    
//     User.findById(id, function(err, user) {
//         done(err, user);
//     });
// });

passport.deserializeUser(function(id, done) {    
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err);
      });
  });
