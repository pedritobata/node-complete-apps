const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req,res,next) => {
  //uso el mismo nombre del parametro que definí en el router!!
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    res.render('shop/product-detail', {
      pageTitle: product.title,
      product:product,
      path: '/products'
    });
  });
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartproducts = [];
      for(let product of products){
        const cartProductData = cart.products.find(p=>p.id===product.id);
        if(cartProductData){
          cartproducts.push({productData: product, qty: cartProductData.qty});
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartproducts
      });
    });
  });

  
};

exports.postCart = (req,res,next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId,product.price);
    //console.log('product.price', product.price);
  });
  
  
  res.redirect('/cart');
};

exports.postDeleteCartProduct = (req,res, next) => {
   const prodId = req.body.productId;
   Product.findById(prodId, product => {
      Cart.deleteProduct(prodId, product.price);
   });
   res.redirect('/cart');
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
