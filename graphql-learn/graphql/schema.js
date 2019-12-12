const { buildSchema } = require('graphql');

//la definicion de los esquemas se hace con puro texto. Usamos backticks por comodidad
//hay como dos tipos de objetos: el que define el tipo de query con su correspondiente metodo handler(schema)
//el otro tipo sería el objeto que define el handler (Rootquery mapea que metodo será el handler y qué tipo devuelve) 
//y su tipo de retorno (que tambien puede ser otro objeto: testData )
//ojo que en nuestro caso el metodo handler que implementa el query es hello
//el simbolo "!" indica que ese dato es requerido
/*
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
*/

//Este schema es para mutation
//notar las palabras clave:
//mutation, para indicar que es una operacion que produce cambios en el backend
//input, para definir un tipo pero de parametro de entrada y NO de retorno
//para los valores de retorno se usa type
//notar que GQl no maneja tipos de dato de fechas, las trata como strings
//GUARDA!!! se tiene que agregar un schema query (aunque sea dummy) de TODAS MANERAS PA QUE FUNQUE LA VAINA!!!
module.exports = buildSchema(`

     type Post {
         _id: ID!
         title: String!
         content: String!
         imageUrl: String!
         creator: User!
         createdAt: String!
         updatedAt: String!
     }

     type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]
     }

     input UserInputData {
         email: String!
         name: String!
         password: String!
     }

     input PostInputData {
         title: String!
         content: String!
         imageUrl: String!
     }

     type AuthData {
         token: String!
         userId: String!
     }

     type PostData {
         posts: [Post!]!
         totalPosts: Int!
     }

     type RootMutation {
         createUser(userInput: UserInputData) : User!
         createPost(postInput: PostInputData) : Post!
         updatePost(id: ID!, postInput: PostInputData) : Post!
     }

     type RootQuery {
         login(email: String!, password: String!) : AuthData!
         posts(page: Int!): PostData!
         post(id: ID!): Post!
     }

     schema {
         mutation: RootMutation
         query: RootQuery
     }
     
`);