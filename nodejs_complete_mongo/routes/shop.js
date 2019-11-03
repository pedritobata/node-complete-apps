const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

//usamos el comodin dinamico dos puntos
//ojo que a pesar de que estamos usando el metodo get() y este hace que las
//rutas se comporten como "exact", el comodin hace que esa parte de la ruta 
//ya NO sea exact, por lo tanto tener cuidado con el orden de las rutas para
//que el comodin no impida que se llegue a otrasa rutas mas abajo, por ejemplo
//si debajo de la ruta comodin pongo /products/delete , esta ruta nunca será alcanzada!!

router.get('/products/:productId',shopController.getProduct);
/* 
router.get('/cart', shopController.getCart);

router.post('/cart',shopController.postCart);

router.post('/create-order',shopController.postOrder);

router.post('/delete-cart-product',shopController.postDeleteCartProduct);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout); */

module.exports = router;
