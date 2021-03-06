const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');



router.put('/signup',[
    body('email')
    .trim()
    .isEmail()
    .custom((value, { req }) => {
        return User.findOne({email: value})
        .then(userDoc => {
            if(userDoc){
                return Promise.reject('Email already exists.');
            }
        })
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({min: 5}),
    body('name')
    .trim()
    .not()
    .isEmpty()
],
authController.signup);

router.post('/login', authController.login);

router.get('/status',isAuth, authController.getUserStatus);
//puedo usar path o put para actualizar
router.patch('/status',isAuth, [
    body('status').trim().not().isEmpty()
] , authController.updateUserStatus);

module.exports = router;
