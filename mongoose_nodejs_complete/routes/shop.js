const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);


router.get('/products/:productId',shopController.getProduct);


router.post('/cart',shopController.postCart);


router.get('/cart', shopController.getCart);

router.post('/delete-cart-product',shopController.postDeleteCartProduct);



router.post('/create-order',shopController.postOrder);


router.get('/orders', shopController.getOrders); 



module.exports = router;
