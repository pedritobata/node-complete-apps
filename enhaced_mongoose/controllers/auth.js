
exports.getLogin = (req,res,next) => {
    console.log(req.get('Cookie'));
    //ojo que el cliente nos va a enviar las cookies siempre por defecto!!
    //es por eso que las podemos obtener del request que viene del cliente
    //con la cookie ya podemos saber si el user estaba autenticado
    //tener en cuenta que el valor true que llega de la cookie es solo UN STRING!!!
    //hacemos una pequeña validacion para enviar a nuestra vista true COMO BOOLEANO!!

    //Ojo que el cliente nos envia todas las cookies que tenga, incluso las que les han creado otros web sites!!
    //asimismo, el cliente le enviará nuestras cookies a otros sites!!

    //Acá hay un guardaza!!. el cliente puede manipular la cookie manualmente en su browser y
    //ponerle siempre true. esto se debe solucionar y mejor , para operaciones sensibles
    //usar SESSION
    //  const loggedIn = req.get('Cookie').split('=')[1].trim() === 'true';

    //con session
    const loggedIn = req.session.loggedIn;
    console.log(req.session);
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: loggedIn
    });
};

exports.postLogin = (req,res,next) => {
    //si cargamos un atributo en el request e inmediatamente llamamos
    //a redirect, con esto ya se emitió un response, lo cual hace que el request anterior
    //manque y por lo tanto se habrá perido mi atributo de login
    //la diferencia con el atributo user que cargamos en el request en app.js es que
    //como esta dentro de un MW, este se ejecutará con CADA REQUEST que se genere, por eso
    //siempre el user está disponible en cada controller
    //req.isLoggedIn = true;

    //Se podría usar una cookie (que al final no es segura para autenticacion)
    //las cookies guardan info que el servidor envía al cliente y éste la guarda en el browser
    //las cookies se pueden configurar pasando parametros separados por ";".
    //se puede configurar: Expires=  ; Domain= (qué dominio aceptamos)  ;  
    //Max-Age=   ; Secure  (la cookie se genera solo si el cliente usa https) ;
    //HttpOnly  (El cliente no podrá leer la cookie en su browser usando JS!!, pero sí lo
    //podría hacer modificando la cookie en chrome F12)
    //  res.setHeader('Set-Cookie','loggedIn=true; Expires=');


    //usaremos session para cargar un valor (en este caso boolean) que nos indique 
    //que el usuario esta logueado. Obviamente para eso se necesita una logica de validacion de 
    //credenciales, pero asumiremos que las credenciales fueron validas!!
    //express session nos guarda la session en una variable anexada al request en el momento
    //que el MW de app.js creo la sesion!!
    req.session.loggedIn = true;//asignamos una variable nuestra para que indique que el user está logueado



    res.redirect('/');
};