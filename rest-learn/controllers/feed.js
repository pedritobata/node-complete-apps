const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const path = require('path');
const fs = require('fs');


exports.getPosts = (req,res,next) => {
    const page = req.query.page || 1;
    const perPage = 2;
    let totalItems = null;
    Post.find()
    .countDocuments()
    .then(count => {
        totalItems = count;
        return Post.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
       
    })
    .then(posts => {
        console.log(posts);
        res.status(200).json({message: 'Fetched posts successfully', posts: posts, totalItems: totalItems})
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;//atributo nuestro para el status
        }
        next(err);
    });
};

exports.createPost = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed. Entered values incorrect!!');
        error.statusCode = 422;//asignamos una propiedad inventada por nosotros para el status
        throw error;//el handle del error se hará en el MW!!
    }
    if(!req.file){
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    console.log(req.file);
    const title = req.body.title;//el body ya lo agrega el MW del bodyparser al request
    const content = req.body.content;
    // logica para crear post en la BD
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: imageUrl,
        creator: {name: 'fernandillo'},
        //los campos createdAt y updatedAt seran creados automaticamente por mongoose
        //gracias a que en el modelo Post configuramos timeStamps : true
    });

    post.save()
    .then(result => {
        console.log('Post added!!');
        res.status(201).json({
            message: "Post created successfully",
            post: result
        });
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;//atributo nuestro para el status
        }
        next(err);
    });
};

exports.getPost = (req,res,next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not found Post.');
            error.statusCode = 404;
            throw error;//estamos dentro de un then y estamos haciendo throw error en vez de next(error)?
            //sí, es asi, porque este error será enviado al bloque catch de la promesa y ahi ya se envia 
            //como next(error)!!!
        }
        res.status(200).json({message: 'Post fetched', post: post});
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;//atributo nuestro para el status
        }
        next(err);
    });
};

exports.putPost = (req, res , next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file){//si el cliente envia un file nuevo
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not found Post.');
            error.statusCode = 404;
            throw error;
        }
        //Si el update tambien cambia la imagen , entonces borramos la antigua
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
    })
    .then(result => {
        res.status(200).json({message: 'Post updated!', post: result});
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not found Post.');
            error.statusCode = 404;
            throw error;
        }

        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        console.log('Post Deleted');
        res.status(200).json({message: 'Post deleted.'});
    })
    .catch(err=> {
        if(!err.statusCode){
            err.statusCode = 500;
        }
    });  
};

const clearImage = filePath => {
    filePath = path.join(__dirname,'..',filePath);
    fs.unlink(filePath, err => console.log(err));
};