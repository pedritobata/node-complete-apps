const Product = require('../models/product');
const Order = require('../models/order');
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
  req.user
    .populate('cart.items.productId')
    .execPopulate()
      .then(user=>{
      const products = user.cart.items;
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
   req.user.removeFromCart(prodId)
   .then(result=>{
    res.redirect('/cart'); 
   })
   .catch(err=>console.log(err));
};


exports.postOrder = (req,res, next) => {
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user=>{
    const products = user.cart.items.map(i=> {
      return {
        //para poder guardar toda la data del producto tenemos que 
        //recurrir a una propiedad especial de mongoose : _doc
        //tener en cuenta que el populate de arriba no hacia magia cuando
        //el atributo a popular está anidado, osea el path no es directo
        product: {...i.productId._doc},
        quantity: i.quantity
      }
    });
    const order = new Order({
      products: products,
      user: {
        userId: user,//mongoose extrae el id del objeto user automaticamente
        name: user.name
      }
    });
    return order.save();
  }).then(result => {
    //limpiamos la carta con nuestro metodo custom
    return req.user.clearCart();
  })
  .then(()=>{
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
};





exports.getOrders = (req, res, next) => {
  //mongoose permite busqueda con una especie de where!!
  Order.find({'user.userId' : req.user._id})
  .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      }); 
  })
  .catch(err=>console.log(err));
};

