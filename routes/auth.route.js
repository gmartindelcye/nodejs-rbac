const router = require('express').Router();
const User = require('../models/user.model');
const {body, validationResult} = require('express-validator');
const passport = require('passport');


router.get('/login', async(req, res, next) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/auth/login',
    failureFlash: true,
}));

router.get('/register', async(req, res, next) => {
    res.render('register');
});

router.post('/register', [
    body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail().toLowerCase(),
    body('password').trim().isLength({ min: 2 }).withMessage('Password must be at least 2 characters long'),
    body('password2').custom((value, { req }) => {  
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
] , 
async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            res.render('register', { email: req.body.email, messages: req.flash() });
            return;
        }
        const { email } = req.body;
        const doesExist = await User.findOne({ email });
        if (doesExist) {
            res.redirect('/auth/register');
            return;
        }

        const user = new User(req.body);
        await user.save();
        req.flash('success', `${user.email} registration success, you can login now`);
        res.redirect('/auth/login');
        res.send(user);
    } catch (error) {
        next(error);
    }
});

router.get('/logout', async(req, res, next) => {
    req.logout();
    res.redirect('/');
});


module.exports = router;