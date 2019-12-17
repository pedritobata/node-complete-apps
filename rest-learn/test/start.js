//Este archivo será reconocido por mocha como contenedor de tests
//Pero para que esto sea así, debemos crear la carpeta "test" para que contenga a 
//nuestros archivos de test


//usamos la funcion expect de chai. Chai tambien ofrece las funciones should y assert
//estos tres metodos hacen lo mismo, solo que su sintaxis es un poco distinta
const expect = require('chai').expect;

//Para correr los tests configuramos el script test de package.json
//   "test": "mocha",
//corremos el comando :  npm test


//crearemos un par de tests estúpidos para probar
it('Should add numbers correctly.', function(){
    const n1 = 2;
    const n2 = 3;
    //como se aprecia, expect trata de seguir una sintaxis cercana al idioma ingles normal
    expect(n1 + n2).to.equal(5);
})

it('Should add numbers correctly.', function(){
    const n1 = 2;
    const n2 = 3;
    expect(n1 + n2).not.to.equal(6);
})