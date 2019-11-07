
exports.getLogin = (req,res,next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.isLoggedIn
    });
};

exports.postLogin = (req,res,next) => {
    //si cargamos un atributo en el request e inmediatamente llamamos
    //a redirect, con esto ya se emitió un response, lo cual hace que el request anterior
    //manque y por lo tanto se habrá perido mi atributo de login
    req.isLoggedIn = true;

    //la diferencia con el atributo user que cargamos en el request en app.js es que
    //como esta dentro de un MW, este se ejecutará con CADA REQUEST que se genere, por eso
    //siempre el user está disponible en cada controller

    res.redirect('/');
};