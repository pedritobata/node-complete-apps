const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('No auth header found.');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];//el token llega como: Bearer <token>
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, "supersecretsecret");
    }catch(err){
        err.statusCode = 500;
        throw err; 
    }
    if(!decodedToken){
        const error = new Error('Not authenticated - token invalid.');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;//cargamos el userId a todos los request que entren
    //porque esto es un MW!!!
    next();
};