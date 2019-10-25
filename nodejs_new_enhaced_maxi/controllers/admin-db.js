const Product = require('../models/product-db');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(null,title, imageUrl, description, price);
  product.save()
  .then(()=>{
    res.redirect('/');
  })
  .catch(err=>{console.log(err)});
  
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode){
    return res.redirect("/");
  }
  Product.findById(req.params.productId, product => {
    if(!product){
      res.redirect("/");
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '',//mando el path vacio para que no se le cambie el estilo active a ningun link del nav
      editing: editMode,
      product: product
    });
  });
  
};

exports.postEditProduct = (req,res,next) => {
  const prodId = req.body.prodId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(prodId,title, imageUrl, description, price);
  product.save();
  res.redirect('/admin/products');
};

exports.postDeleteProduct = (req,res, next) => {
    const productId = req.body.productId;
    console.log('eliminar:',productId);
    Product.deleteProductById(productId);
    res.redirect('/admin/products'); 
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  });
};
