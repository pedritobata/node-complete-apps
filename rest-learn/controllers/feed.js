const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const path = require("path");
const fs = require("fs");
const User = require("../models/user");
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 2;
  try {
      //async / await se usa solo para PROMESAS y para FUNCIONES QUE IMITAN PROMESAS pero no lo son
      //como es el caso de toooodos los metodos de mongoose. FUIMOS ENGAÑADOS TODO ESTE TIEMPO JAJA!!!
      //NO ERAN PROMESAS EN REALIDAD
      //Por dentro , await usa then() , wrappeando el codigo que sigue a este await!!
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })//ordenamos los posts de forma decreciente en fecha, del mas antiguo al reciente
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Fetched posts successfully",
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; //atributo nuestro para el status
    }

    next(err);
    //throw err;
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed. Entered values incorrect!!");
    error.statusCode = 422; //asignamos una propiedad inventada por nosotros para el status
    throw error; //el handle del error se hará en el MW!!
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  console.log(req.file);
  const title = req.body.title; //el body ya lo agrega el MW del bodyparser al request
  const content = req.body.content;
  // logica para crear post en la BD
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
    //los campos createdAt y updatedAt seran creados automaticamente por mongoose
    //gracias a que en el modelo Post configuramos timeStamps : true
  });
  try {
    await post.save();
    console.log("Post added!!");
    const user = await User.findById(req.userId);
    user.posts.push(post); //agregamos al array que contiene los posts del user en memoria
    //aca solicitamos guardar y se guardaran los posts del user preparados antes
    await user.save();

    //usamos Sockets para notificar a los clientes que se ha añadido un nuevo post (push)
    //emit es para notificar a todos incluido el cliente que creó el post, es decir , el que
    //disparó el evento. broadcast() notifica a todos menos al que disparó el evento
    //primer argumento: el channel o evento. el nombre es inventado
    //segundo argumento : la data que quiera mandar, de la forma que quiera!!, en este caso un objeto con
    //mis atributos inventados que crea necesarios
    io.getIO().emit('posts',{ action: 'create', post: post });

    res.status(201).json({
      message: "Post created successfully",
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; //atributo nuestro para el status
    }
    next(err);
  }
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not found Post.");
        error.statusCode = 404;
        throw error; //estamos dentro de un then y estamos haciendo throw error en vez de next(error)?
        //sí, es asi, porque este error será enviado al bloque catch de la promesa y ahi ya se envia
        //como next(error)!!!
      }
      res.status(200).json({ message: "Post fetched", post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500; //atributo nuestro para el status
      }
      next(err);
    });
};

exports.putPost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    //si el cliente envia un file nuevo
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId).populate('creator')
    .then(post => {
      if (!post) {
        const error = new Error("Could not found Post.");
        error.statusCode = 404;
        throw error;
      }
      //solo permitiremos continuar con el update si el user fue el que creó el post
      if (req.userId !== post.creator._id.toString()) {
        const error = new Error("User is not allowed to edit this post.");
        error.statusCode = 403;
        throw error;
      }
      //Si el update tambien cambia la imagen , entonces borramos la antigua
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      //notificamos a los clientes con el socket
      io.getIO().emit('posts', {action: 'update', post: result});
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not found Post.");
        error.statusCode = 404;
        throw error;
      }
      //solo permitiremos continuar con el delete si el user fue el que creó el post
      if (req.userId !== post.creator.toString()) {
        const error = new Error("User not allowed to delete this post.");
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      console.log("Post Deleted");
      //notificamos con el socket
      io.getIO().emit('posts', { action: 'delete', post: postId });
      res.status(200).json({ message: "Post deleted." });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => console.log(err));
};
