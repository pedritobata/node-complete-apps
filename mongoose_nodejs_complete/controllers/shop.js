const Product = require('../models/product');
//const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  //mongoose tiene el metodo find() el cual No devuelve un cursos como mongo normal
  //pero puedo obtener un cursor usando find().cursor()  !!
  Product.find()//find devuelve defrente un array
  .then(products=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err=>{
    console.log(err);
  });
};

exports.getProduct = (req,res,next) => {
 
  const prodId = req.params.productId;
  //por suerte mongoose tiene un metodo findById!!
  Product.findById(prodId)
  .then(product=>{
    res.render('shop/product-detail', {
      pageTitle: product.title,
      product:product,
      path: '/products'
    });
  })
  .catch(err=>{console.log(err)});

}

exports.getIndex = (req, res, next) => {
  
  Product.find()
  .then(products=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch(err=>{
    console.log(err);
  });
};


exports.postCart = (req,res,next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product=>{
    return req.user.addToCart(product);
  })
  .then(result=>{
    console.log(result);
    res.redirect('/cart');
  })
  .catch(err=>console.log(err));

};



exports.getCart = (req, res, next) => {
  req.user.getCart()
      .then(products=>{
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
      })
      .catch(err=>console.log(err));
};



exports.postDeleteCartProduct = (req,res, next) => {
   const prodId = req.body.productId;
   req.user.deleteItemFromCart(prodId)
   .then(result=>{
    res.redirect('/cart'); 
   })
   .catch(err=>console.log(err));
};


exports.postOrder = (req,res, next) => {
  req.user.addOrder()
  .then(result => {
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
};





exports.getOrders = (req, res, next) => {
  req.user.getOrders()
  .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      }); 
  })
  .catch(err=>console.log(err));
};

