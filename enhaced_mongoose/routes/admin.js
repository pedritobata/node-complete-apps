const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

const router = express.Router();

// /admin/add-product => GET
//se pueden agregar tantos argumentos como MW se quiera ejecutar en ese orden!!
router.get('/add-product',isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',isAuth,  adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',[
    body('title')
        .isString()
        .trim()
        .isLength({ min: 3 }),
    /* body('imageUrl')
        .isURL(), */
    body('price')
        .isFloat(),
    body('description')
        .isString()
        .trim()
        .isLength({ min: 5 }),

] ,isAuth,  adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth,  adminController.getEditProduct);

router.post('/edit-product',[
    body('title')
        .isString()
        .trim()
        .isLength({ min: 3 }),
   /*  body('imageUrl')
        .isURL(), */
    body('price')
        .isFloat(),
    body('description')
        .isString()
        .trim()
        .isLength({ min: 5 }),

] ,isAuth,  adminController.postEditProduct);

// router.post('/delete-product',isAuth,  adminController.postDeleteProduct);
router.delete('/product/:productId',isAuth,  adminController.deleteProduct);

module.exports = router;
