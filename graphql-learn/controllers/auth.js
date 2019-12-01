const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


exports.signup = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, 12)
    .then(hashedPass => {
        const user  = new User({
            name: name,
            email: email,
            password: hashedPass
        });
        return user.save();
    })
    .then(result => {
        res.status(201).json({message: 'User created.', userId: result._id});
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;//atributo nuestro para el status
        }
        next(err);
    }); 
    
};

exports.login = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email:email})
    .then(user => {
        if(!user){
            const error = new Error('User not found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if(!isEqual){
            const error = new Error('Wrong password.');
            error.statusCode = 401;
            throw error;
        }
        //generamos el JWT
        const token = jwt.sign({//primer argumento: data que agregaremos al token
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 
        "supersecretsecret",//esta es la firma que se utilizará para el cifrado del token
        {//configuracion del token
            expiresIn: '1h'
        }
        );
        //le mandamos al cliente el token y el id del user
        //el id del user lo necesita para varias funcionalidades, ya que una vez que el 
        //user lo ingresa, si no lo guarda el frontend no tendrá de dónde obtenerlo luego
        res.status(200).json({token: token, userId: loadedUser._id.toString()});
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;//atributo nuestro para el status
        }
        next(err);
    }); 
};

exports.getUserStatus = (req,res,next) => {
    User.findById(req.userId)
    .then(user => {
        if(!user){
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({status: user.status});
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;//atributo nuestro para el status
        }
        next(err);
    }); 
}

exports.updateUserStatus = (req,res,next) => {
    const newStatus = req.body.status;
    User.findById(req.userId)
    .then(user => {
        if(!user){
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        user.status = newStatus;
        return user.save();
    })
    .then(result => {
        res.status(200).json({message: 'User status upadated.'});
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;//atributo nuestro para el status
        }
        next(err);
    }); 
}