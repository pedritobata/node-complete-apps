const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth');

//Para agrupar mis tests y que se puedan diferenciar en el log a qué test pertenecen
//uso el metodo describe que nos proporciona mocha
//describe(titulo, function(){ mis tests it })
describe('Auth Middleware', function(){
    it('Should throw an error when authorization header is not present', function(){
        //solo vamos a probar esta parte del middleware:
        //   const authHeader = req.get('Authorization');
        //por tanto modificamos el request para que su metodo get devuelva otro valor
        const req = {
            get: function(headerName){
                return null;
            }
        }
        //usaremos bind porque si invoco la funcion directemente, se lanzará la excepcion que
        //de por sí lanza dicho MW y que justo lo que queremos probar.
        //De esta manera le pasamos la funcion pre invocada a chai para que maneje la excepcion
        //parecido a lo que hacemos en React cuando queremos enviar por props una funcion preinvocada con parametros
        //notar que no nos intersan los paramtros res y next que requiere el MW, le passamos defaults!!
        expect(authMiddleware.bind(this,req, {}, () => {})).to.throw('No auth header found.');
    })
    
    it('Should throw an error if the authorizartion header is only one string', function(){
        const req = {
            get: function(headerName){
                return "xyz";
            }
        }
        expect(authMiddleware.bind(this, req, {}, ()=> {})).to.throw()
    })

    it('Should yield a userId after decoding token', function(){
        const req = {
            get: function(headerName){
                return "Bearer asadasasfaff";
            }
        }
        //como en el MW original la logica incluye una verficacion del token
        //vamos a usar un metodo del paquete sinon que nos crea una funcion que suplanta a la original
        //para esto hemos importado el objeto jwt del global y hacemos la jugada para suplantarlo
        //aqui nos ayuda la forma en que funcionan los modulos externos en Nodejs, acordarse que es como
        //si se compartieran todos los archivos de los packages o modules en un solo global o algo asi!!
        //como jwt es un modulo externo, está compartido y si lo modifico, esto afectará a quien lo 
        //consuma luego
        //suplantamos el metodo verify del objeto sinon:
        //stub nos genera un impostor con varios metodos y atributos utiles!!
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({  userId: 'abc' });

        //invocamos al MW manualmente para que se genere la propiedad userId
        authMiddleware(req, {}, ()=>{});

        expect(req).to.have.property('userId');
        //el metodo property puede recibir dos argumentos (atributo, valor)
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        //por ultimo, restauramos la funcion verify a su estado normal ya que otros test podrian 
        //usarla y si esta modificada mancarían
        jwt.verify.restore();
        

    })
})

