var express = require('express')
const path = require('path')

const router = express.Router();


const products = [];


router.get('/add-product', (req,res,next)=>{
   
   res.render('add-product',
   {
        pageTitle: 'Add Product!!', 
        path: '/admin/add-product',
        activeAddProduct:true, 
        productCSS:true, formsCSS: true
   });
});



router.post('/add-product', (req,res,next)=>{
    console.log(req.body);
    products.push({title:req.body.title});
    res.redirect('/');
});

module.exports.router = router;
module.exports.products = products;