const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', function(){
    //console.log('initializing login test');
    it('Should throw an error with code 500 if accessing database fails.', function(done){
        //suplantamos la llamada a la base da datos para simular que responde con error
        sinon.stub(User, 'findOne');
        User.findOne.throws();//metodo magico que se obtiene al suplantar a findOne usando stub!!
        //OJO que el codigo que corre el metodo login del authController es asincrono!!
        //por eso estamos usando el argumento "done" que nos proporciona mocha para manejar las operaciones
        //asincronas. done sería el equivalente a await
        const req = {
            body: {
                email: "test@test.com",
                password: "cualquiera"
            }
        }
         
        //login devuelve una promesa cuando resuelve o cuando falla
        const resp = AuthController.login(req, {}, ()=>{});
        console.log('respuesta de login():', resp);
        resp.then(result => {
            console.log('result login test:', result);
             expect(result).to.be.an('error');//error es una palabra reservada de chai. Chai reconoce algunos
             //tipos de datos

             expect(result).to.have.property('codeStatus', 500);
             //usamos done para que la operacion asincrona sea esperada, es decir , como un await
            done();
           
         });

        //User.findOne.restore();

    });
});