const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1];//el token llega como: Bearer <token>
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, "supersecret");
    }catch(err){
        req.isAuth = false;
        return next();
    }
    if(!decodedToken){
        req.isAuth = false;
        return next();
    }
    req.userId = decodedToken.userId;//cargamos el userId a todos los request que entren
    //porque esto es un MW!!!
    req.isAuth = true;
    next();
};