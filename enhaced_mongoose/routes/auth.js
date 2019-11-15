const express = require('express');
const router = express.Router();

//este paquete nos permite hacer validaciones
//hay varios validadores, por ejemplo check es el mas general y valida todo el request
//pero tambien puedo usar por ejemplo body , el cual solo buscará validar el body del request
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');


router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/signup', authController.getSignup);
router.post('/logout', authController.postLogout);
//agregamos un MW para validar la data del user
//check y sus chain methods nos devuelven un MW y agregan al request
//todos los posibles errores que se hayan encontrado al validar
//el argumento de check puede ser el nombre de un solo campo o el de varios (esto ultimo seria en array)
//hay un monton de validaciones built in en express validator
//estas se basan en validator.js otro package  . ver github!!
//tambien puedo agregar custom validators
router.post('/signup', 

//los check los puedo agregar como MWs seguidos por comas dentro del argumento de router.post() o 
//tambien COMO UN SOLO ARREGLO que contenga todos los checks!!
check('email').isEmail().
withMessage('Please enter a valid Email') 
//puedo usar funciones sanitazers
.trim()
.normalizeEmail()//esta pasa todo a minusculas y no sé que más
//el segundo parametro me da la opcion de definir en un objeto otra info que quiera obtener
//para ser usada en mi callback
.custom((value, { req })=>{
    if(value === 'carlossteinzegarra2017@hotmail.com'){
        throw new Error('Mancó fantomas!!');
    }
    //este callback tiene que retornar obligatoriamente un boolean, un error o una promesa!!
    //true dice que aprobó la validacion
    //false o throw error dicen que falló
    //return true;

    //vamos a usar una validacion asincrona
    //validaremos la BD a ver si existe el user con ese email, esto quiere decir que en el controller
    //ya no validaremos eso!!
    return User.findOne({ email: value })
    .then(userDoc => {
        if(userDoc){
            return Promise.reject('Email already exists!!!');
        }
    });
    
}), 
//usamos otro tipo de validator solo para el body
//tanto body como check pueden recibir un segundo argumento con el mensaje
//que se quiere mostrar para cuando alguna de todas las validaciones de este validator fallen
body('password','Please enter a password with only numbers and text and at least 5 characters.')
.isLength({ min: 5 }).isAlphanumeric(),
body('confirmPassword','Passwords have to match!!')
.custom((value, { req }) => {
    if(value !== req.body.password){
        return false;
    }
    return true;
})
,authController.postSignup);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);


module.exports = router;