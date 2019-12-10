const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

//los resolvers se devuelven dentro de un objeto
module.exports = {
  /*   hello(){
        return {
            text: 'Hello World!!',
            views: 132
        }
    }
     */

    //handler para mutation
    //ojo que estos handlers reciben dos argumentos en realidad
    //el primero es un objeto args que contiene como propiedades los argumentos que 
    //definimos en el schema , es decir que para acceder al atributo mail por ejemplo
    //sería : args.userInput.email
    //en esta caso usaremos destructuring para acceder a los campos
    //y el segundo argumento es el request
    createUser: async function ({userInput}, req){
        //para validar usaremos el paquete validator, el cual srivió de base para express-validator
        //solo que acá no podemos usar este ultimo porque no manejamos routes ,con
        //GQl solo hay una ruta para todo!!
        //entonces la validacion es casi a mano!
        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.push({message: 'Email is not valid.'});
        }
        if(validator.isEmpty(userInput.password) ||
           !validator.isLength(userInput.password, {min: 5})){
            errors.push({message: 'Password invalid.'});
        }
        if(errors.length > 0){
            const error = new Error('Invalid Input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({email: userInput.email});
        if(existingUser){
            const error = new Error('User already exists!');
            throw error;
        }
        const hashedPass = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            name: userInput.name,
            email: userInput.email,
            password: hashedPass
        });
        const createdUser = await user.save();
        //retornamos lo que el schema especificó que debemos retornar
        //encima que le pusimos que fuera requerido
        //notar que mongoose tiene una propiedaad _doc que te devuelve el objeto conteniendo al user
        return {
            ...createdUser._doc, _id: createdUser._id.toString()
        }
    },

    login: async function({email, password}){
        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('User not found.');
            error.code = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Password invalid.');
            error.code = 401;
            throw error;
        }
        //la autenticacion con GQl sigue siendo normal, enviando un token!!
        const token = jwt.sign({
            email: user.email,
            userId: user._id
        },'supersecret', { expiresIn: '1h' });
        return {userId: user._id.toString(), token: token};
    },

    createPost: async function({postInput}, req){
        if(!req.isAuth){
            const error = new Error('User not authenticated.');
            error.code = 401;
            throw error;
        }
        const errors = [];
        if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min:5})){
            errors.push({message: "Title is invalid."});
        }
        if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min:5})){
            errors.push({message: "Content is invalid."});
        }
        if(errors.length > 0){
            const error = new Error('Invalid Input');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('User not found.');
            error.code = 401;
            throw error;
        }
        
        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });
        const createdPost = await post.save();
         //agregamos el post al user en la BD
        user.posts.push(createdPost);
        await user.save();
        return {
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
        }
    }

    //********  OJO   ***********
        //para probar GQl seteamos en el MW un atributo extra graphiql que nos permitirá
        //usar el navegador para probar en lugar del postman (localhost:8080/graphql)
        //esa aplicacion que se abre en el navegador tiene varias herramientas muy utiles!!

}