const Product = require('../models/product');

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
  const product = new Product(title, imageUrl, description, price);
  product.save();
  res.redirect('/');
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
