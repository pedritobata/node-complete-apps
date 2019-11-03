const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  
  Product.findByPk(prodId)
  .then(product=>{
    res.render('shop/product-detail', {
      pageTitle: product.title,
      product:product,
      path: '/products'
    });
  })
  .catch(err=>{console.log(err)});


  //alternativa: usdando findAll(where)
  /*
  Product.findAll({where: {id: prodId}})
  .then(products=>{
    res.render('shop/product-detail', {
      pageTitle: products[0].title,
      product:products[0],
      path: '/products'
    }); 
  })
  .catch(err=>console.log(err));
  */

}

exports.getIndex = (req, res, next) => {
  
  //el metodo findAll() de sequelize acepta un objeto como argumento
  //donde le podemos especificar predicados como: where, orderBy, etc!!
  Product.findAll()
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

exports.getCart = (req, res, next) => {
  //para acceder al Cart que tiene el user, uso el metodo magico creado por sequelize
  //gracias a la asociacion de tablas que se hizo en app.js
  //en este caso es un get para obtener y Cart porque tiene una relacion belongdTo
  req.user.getCart()
  .then(cart=>{
    //otro metodo magico getProducts() gracias a la asociacion de tablas y el belongsToMany
    //sequelize se engcarga de los joins a las tablas de detalle , qué bacan!!!
    //acá el return está por costumbre nomas, por si quisiera continuar con las promesas
    return cart.getProducts()
           .then(products=>{
            res.render('shop/cart', {
              path: '/cart',
              pageTitle: 'Your Cart',
              products: products
            });
           })
           .catch(err=>console.log(err));
  })
  .catch(err=>console.log(err));
  
};

exports.postCart = (req,res,next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart()
  .then(cart=>{
    fetchedCart = cart;
    //getProducts en plural porque la asociacion es belongsToMany!!
    return cart.getProducts({where: {id: prodId}});
  })
  .then(products=>{
    let product;
    if(products.length > 0){
      product = products[0];
    }
    
    if(product){
      //otra vez sequelize y los metodos y propiedades magicas
      //puedo hacer como un join entre tablas product y cartItem con la propiedad magica!!
      newQuantity = product.cartItem.quantity + 1;
      return product;
    }
    return Product.findByPk(prodId);
  })
  .then(product=>{
    return fetchedCart.addProduct(product, {through : {quantity: newQuantity} });
  })
  .then(()=>{
    res.redirect('/cart');
  })
  .catch(err=>console.log(err));
};

exports.postDeleteCartProduct = (req,res, next) => {
   const prodId = req.body.productId;
   req.user.getCart()
   .then(cart=>{
     return cart.getProducts({where: {id:prodId}});
   })
   .then(products=>{
     const product = products[0];
     return product.cartItem.destroy();
   })
   .then(result=>{
    res.redirect('/cart'); 
   })
   .catch(err=>console.log(err));

};

exports.getOrders = (req, res, next) => {
  //como user esta relacionado solo coo order
  //entonces debo especificar que se incluya en el select a los productos que se
  //relacionan con las order
  //pongo products en plural porque sequelize pluraliza las tablas
  req.user.getOrders({include : ['products']})
  .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      }); 
  })
  .catch(err=>console.log(err));
};

exports.postOrder = (req,res, next) => {
  let fetchedCart;
  req.user.getCart()
  .then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  })
  .then(products => {
    return req.user.createOrder()//metodo magico
      .then(order => {
        return order.addProducts(products.map(prod => {
          prod.orderItem = {quantity: prod.cartItem.quantity};
          return prod;
        }));
      })
      .catch(err => console.log(err));
  })
  .then(result => {
    //con este metodo magico elimino los productos asociados al Cart
    fetchedCart.setProducts(null);
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
