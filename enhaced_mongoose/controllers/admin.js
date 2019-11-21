const Product = require('../models/product');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;//el MW de multer parsea y anexa al req el binario con el nombre file
  const price = req.body.price;
  const description = req.body.description;

  //si no paso el filtro de formato permitido en el MW file no se habrá cargado al request
  if(!image){
    console.log('image:',image);
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
          title: title,
          price: price,
          description: description,
          //imageUrl: imageUrl
      },
      errorMessage: 'Attached file is not an image!',
      validationErrors: []
   });
  }

  //lo que guardaremos en la BD para la imagen es solo su path!!
  const imageUrl = image.path;


  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log('!errors.isEmpty()', errors);
    return res.status(422).render('admin/edit-product', {
              pageTitle: 'Add Product',
              path: '/admin/add-product',
              editing: false,
              hasError: true,
              product: {
                  title: title,
                  price: price,
                  description: description,
                  //imageUrl: imageUrl
              },
              errorMessage: errors.array()[0].msg
           });
  };


  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      //throw new Error('Dummy error');
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
      //res.redirect('/500');
      //si mandamos un Error a traves de next(), el MW especial que creamos en app.js lo capturará
      const error = new Error(err);
      error.httpStatusCode = 500;//podemos agregar ingo adicional al error
      
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
              pageTitle: 'Edit Product',
              path: '/admin/edit-product',
              editing: true,
              hasError: true,
              product: {
                  title: updatedTitle,
                  price: updatedPrice,
                  description: updatedDesc,
                  //imageUrl: updatedImageUrl,
                  _id: prodId
              },
              errorMessage: errors.array()[0].msg,
              validationErrors: errors.array()
           });
  };
  
  Product.findById(prodId)
    .then(product => {
      //AUTHORIZATION
      //solo voy a editar los productos que haya creado el current user
      if(String(product.userId) !== req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(updatedImage){//solo guardamos el path de la imagen si el usuario seleccionó una imagen valida
        //borramos la imagen anterior que está en el repo
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = updatedImage.path;
      }
      
      return product.save()
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      });
    })
    
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  //AUTHORIZATION
  //solo voy a cargar los productos que haya creado el current user
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  //Product.findByIdAndRemove(prodId)
  //AUTHORIZATION
  //solo voy a borrar los productos que haya creado el current user
  Product.findById(prodId)
  .then(product => {
    if(!product){
      return next(new Error('Product not found!!'));
    }
    Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
        console.log('DESTROYED PRODUCT');
        fileHelper.deleteFile(product.imageUrl);
        return res.redirect('/admin/products');
    })
  })
  .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      
      return next(error);
    });
};
