const express = require('express')

const adminData = require('./admin');

const router = express.Router();

router.get('/', (req,res,next)=>{
    console.log('shop.js', adminData.products);

   res.render('shop', {prods: adminData.products, pageTitle: 'Shop', path: '/', 
              hasProducts: adminData.products.length > 0, activeShop:true, productCSS:true});
});

module.exports = router;