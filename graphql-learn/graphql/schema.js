const { buildSchema } = require('graphql');

//la definicion de los esquemas se hace con puro texto. Usamos backticks por comodidad
//hay como dos tipos de objetos: el que define el tipo de query con su correspondiente metodo handler(schema)
//el otro tipo sería el objeto que define el handler (Rootquery mapea que metodo será el handler y qué tipo devuelve) 
//y su tipo de retorno (que tambien puede ser otro objeto: testData )
//ojo que en nuestro caso el metodo handler que implementa el query es hello
//el simbolo "!" indica que ese dato es requerido
module.exports = buildSchema(`
     type testData {
         text: String!
         views: Int!
     }

     type RootQuery {
         hello: testData!
     }

     schema {
         query: RootQuery
     }

`);