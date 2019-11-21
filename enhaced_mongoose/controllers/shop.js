const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 2;


exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = req.query.page;
  let totalItems = 0;

  Product.find()
  .countDocuments(numProducts => {//count solo trae la cantidad de registros NO los registros en sí!!
    totalItems = numProducts;
    Product.find()//como esto devuelve un cursor puedo hacer mas operaciones
    //y traerme la data por paginacion
    .skip((page - 1) * ITEMS_PER_PAGE)//digo cuantos registros me salto de la bd
    .limit(ITEMS_PER_PAGE)//digo cuantos registros quiero traer de la bd despues de saltarme los anteriores
  })
  .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        totalProducts: totalItems,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE) 
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};


exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order=>{
    //validamos que la orden le pertenezca al user logueado
    if(!order){
      return next(new Error('No order found'));
    }
    if(String(order.user.userId) !== req.user._id.toString()){
      return next(new Error('Unauthorized'));
    }

  const invoiceName = 'invoice_' + orderId + '.pdf';
  const invoicePath = path.join('data','invoice',invoiceName );
 /*  fs.readFile(invoicePath, (err, data) => {
    if(err){
      console.log(err);
      return next();
    }
    res.setHeader('Content-Type','application/pdf');
    //el disposition sirve para decirle al browser info sobre el archivo
    //inline hace que se abra el archivo en el browser, attachment dice que se se abra una ventana de descarga
    //en el OS
    res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');
    res.send(data); 
  });
  */

  //El aproach anterior con fs.readFile NO es eficiente para archivos grandes porque
  //el servidor enviará TODO el archivo al browser y esto puede demorar en el cliente
  //para solucionar esto usamos streams
  /* const file = fs.createReadStream(invoicePath);
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');
  file.pipe(res);
  //anexamos el stream al response el cual tambie es un writeable stream por eso lo soporta!! 
  
 */

  //Como bonus vamos a usar pdfkit para crear un pdf al vuelo
  const pdfDoc = new PDFDocument();
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');

  //anexamos el pdf a mi repo
  pdfDoc.pipe(fs.createWriteStream(invoicePath));//recordar que el pipe solo anexa a objetos writeable stream
  pdfDoc.pipe(res);//anexamos al response tambien
  //editamos el pdf
  pdfDoc.fontSize(26).text('Invoice');
  pdfDoc.text('=======================');
  let totalPrice = 0;
  order.products.forEach(prod => {
    totalPrice += prod.quantity * prod.product.price;
    pdfDoc.fontSize(14).text(
      `${prod.product.title} - x${prod.quantity}  $${prod.product.price}`  
      );
  });
  pdfDoc.text('----------');
  pdfDoc.fontSize(20).text('Total price: $' + totalPrice);

  pdfDoc.end();//con esto terminamos el stream

  })
  .catch(err=>console.log(err));
  
};