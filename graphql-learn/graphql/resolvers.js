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
    },

    posts: async function({page}, req){
        if(!req.isAuth){
            const error = new Error('User not authenticated.');
            error.code = 401;
            throw error;
        }
        if(!page){
            page = 1;
        }
        const perPage = 2;
        const totalPosts = await Post.find().countDocuments();
        const posts = await Post.find().sort({createdAt: -1})
            .skip((page -1) * perPage)
            .limit(perPage)
            .populate('creator');
            //console.log('posts', posts[0]._doc);
        return {
            totalPosts: totalPosts,
            posts: posts.map(p=> {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                }
            })
        }
    },

    post: async function({id}, req){
        if(!req.isAuth){
            const error = new Error('User not authenticated.');
            error.code = 401;
            throw error;
        }
        const post = await Post.findById(id).populate("creator");
        if(!post){
            const error = new Error("Post not found.");
            error.code = 404;
            throw error;
        }
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },

    updatePost: async function({id, postInput}, req){
        if(!req.isAuth){
            const error = new Error('User not authenticated.');
            error.code = 401;
            throw error;
        }
        const post = await Post.findById(id).populate("creator");
        if(!post){
            const error = new Error("Post not found.");
            error.code = 404;
            throw error;
        } 
        //verificamos que el Post lo haya creado el mismo user que esta logueado
        if(post.creator._id.toString() !== req.userId.toString()){
            const error = new Error("User not authorized to edit post.");
            error.code = 403;
            throw error;
        }
        //validamos los campos del nuevo post
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
        post.title = postInput.title;
        post.content = postInput.content;
        //si el cliente manda el path como undefided es porque la imagen No cambia
        //caso contrario hay que chancar el nuevo path en la BD
        if(postInput.imageUrl !== 'undefined'){
            post.imageUrl = postInput.imageUrl;
        }
        const updatedPost = await post.save();
        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        }
    }

    //********  OJO   ***********
        //para probar GQl seteamos en el MW un atributo extra graphiql que nos permitirá
        //usar el navegador para probar en lugar del postman (localhost:8080/graphql)
        //esa aplicacion que se abre en el navegador tiene varias herramientas muy utiles!!

}