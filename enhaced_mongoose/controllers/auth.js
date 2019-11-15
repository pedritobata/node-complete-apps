const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrigTransport = require('nodemailer-sendgrid-transport');

const { validationResult } = require('express-validator/check');

const crypto = require('crypto');//esta libreria es de Nodejs

const transporter = nodemailer.createTransport(sendgrigTransport({
    auth: {
        api_key: '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'
    }
}));


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
    //Ojo que este parametro ya lo estamos enviado desde el MW en app.js usando req.locals!!
    const loggedIn = req.session.isLoggedIn;
    //console.log(req.session);
    //como flash me devuelve un array vacio [] cada vez que no hay mensajes definidos
    //y como queremos que mas bien nos devuelva null o undefined, validamos para asignarlo nosotros
    let errorMsg = req.flash('error');//recuperamos el mensaje flash cargado en el req anterior
    console.log(errorMsg);
    if(errorMsg.length > 0){
        errorMsg = errorMsg[0];;
    }else{
        errorMsg = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: errorMsg
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: '',
      oldInput: {
          email: '',
          password: '',
          confirmPassword: '',
      },
      validationErrors: []
    });
  };

exports.postLogin2 = (req,res,next) => {
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

    //en este login vamos a cargar recien al user a la session
    //RECONTRA GUARDIA:  el user que se guarda dentro de la session en la BD NO ES EL QUE TIENE LA MAGIA DE MONGOOSE!!!!
    //es por esto que en algunas operaciones donde se necesiten esos metodos magicos va a dar error
    //para esto , en app.js hay que obtener para cada peticion el user, pero obtenerlo desde la collection user

    User.findById('5dc43f609912b105223839db')
    .then(user => {
      req.session.user = user;
      req.session.isLoggedIn = true;//asignamos una variable nuestra para que indique que el user está logueado
      req.session.save(err => {//guardamos en la BD usando save() porque si grabamos normalmente
        //podría pasar que el redirect se dispare antes de grabar en la Bd por la asincronia!!
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
};

exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
    .then(user=>{
        if(!user){
            //el package connect-flash nos agrega al req este metodo para poder
            //enviar mensajes flash
            console.log('No se encontró el user!!');
            req.flash('error','Invalid email or password');
            return res.redirect('/login');
        }
        bcrypt.compare(password, user.password)
        .then(doMatch => {
            if(doMatch){
                req.session.user = user;
                req.session.isLoggedIn = true;
                return req.session.save(err=>{
                    //porsiaca este callback NO es una promesa y NO SE EJECUTA SOLO CUANDO HAYA ERROR
                    //pero nos pasa un argumento con el error si lo hubiera
                    console.log(err);
                    res.redirect('/');
                });
            }
             req.flash('error','Invalid email or password yeah!!');
             return res.redirect('/login');

        })
        .catch(err=>{
            console.log(err);
            res.redirect('/login');
        });
    })
    .catch(err=>console.log(err));
};

exports.postSignup = (req, res, next) => {
    
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    //usamos el validator
    //este metodo extrae los errores cargados por el MW en el request
    //hemos agregado la propiedad "novalidate" en el form de la vista para
    //desactivar las validaciones de html 5
     const errors = validationResult(req);
    if(!errors.isEmpty()){//este metodo es de validator No de JS
        console.log('errors:', errors.array());
        return res.status(422).
            render('auth/signup', {
                pageTitle: 'Signup',
                path: '/signup',
                //array() es otro metodo de validator, nos devuelve un array de objects
                //dentro de cada objeto error hay info sobre el error
                //entre ellas esta el mensaje por defecto que produce validator
                //esto se puede sobreescribir en el MW con el metodo withMessage()
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                },
                validationErrors: errors.array()
            });
    }

    //si existe el user no hacemos nada. Si no existe lo creamos

    //La validacion de la existencia del email se movió al validator que está en routes
  
        //el segundo argumento es el nivel de proteccion de la encriptacion
        //OJO que esta operacion es asincrona
        //Todo este bloque de promises lo anidamos en el de afuera porque
        //si se cumple la condicion anterior, si el user existe, el return tiene
        //que salir directamente del metodo. Notar que el return esta dentro del bloque then
        //principal, entonces no sale del metodo directamente.
        //por tanto si este bloque que sigue lo saco al nivel del promise de afuera entonces
        //nos saltariamos el bcrypt, lo cual haria que hashPassword no exista y por tanto nos de error
        //que se necesita un password!!
        bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'pedritobata@gmail.com',
                subject: 'Testing Nodejs Shop',
                html: '<h1>Este es un email de prueba enviado con Nodemailer</h1>'
            });
        })
        .catch(err=>{console.log(err)});

};


exports.postLogout = (req,res,next) => {
    //destroy elimina el objeto session de la BD!!
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset = (req,res,next) => {
    let errorMsg = req.flash('error');//recuperamos el mensaje flash cargado en el req anterior
    console.log(errorMsg);
    if(errorMsg.length > 0){
        errorMsg = errorMsg[0];;
    }else{
        errorMsg = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: errorMsg
    });
};

exports.postReset = (req,res,next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
        .then(user => {
            if(!user){
                req.flash('error', 'No user found with this email!!');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            return transporter.sendMail({
                to: req.body.email,
                from: 'pedritobata@gmail.com',
                subject: 'Reset Password from Nodejs',
                html: `
                  <p>You requested a password reset yeahh</p>
                  <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `
            });
        })
        .catch(err=>console.log(err));
    });
};

exports.getNewPassword = (req,res,next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user=>{
        let errorMsg = req.flash('error');
        console.log(errorMsg);
        if(errorMsg.length > 0){
            errorMsg = errorMsg[0];;
        }else{
            errorMsg = null;
        }
        res.render('auth/new-password', {
            pageTitle: 'New Password',
            path: '/new-password',
            errorMessage: errorMsg,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err=> console.log(err));

    
};

exports.postNewPassword = (req,res,next) => {
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const newPassword = req.body.password;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.resetToken = undefined,
        resetTokenExpiration = undefined,
        resetUser.password = hashedPassword
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err=>console.log(err));
};