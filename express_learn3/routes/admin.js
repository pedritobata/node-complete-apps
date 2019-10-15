var express = require('express')
const path = require('path')

const router = express.Router();

//esta variable la compartiremos con todos los MW (osea con todas las peticiones)
//pero el problema es que estará disponible tambien para TODOS los users lo cual no es bueno
//La variable está a nivel de SERVIDOR
const products = [];

const rootDir = require('../util/path');

//uso el utilitario rootDir que creé
router.get('/add-product', (req,res,next)=>{
   //res.sendFile(path.join(rootDir,'views','add-product.html'));
   //uso pug
   //estoy mandando una variable path INVENTADA solo para que en la vista se
   // se sepa de donde viene el request y pueda ponerle la clase active al link que corresponda
   res.render('add-product',
   {
        pageTitle: 'Add Product!!', 
        path: '/admin/add-product',
        activeAddProduct:true, 
        productCSS:true, formsCSS: true
   });
});


//notar que uso el mismo path que la ruta anterior
// eso no es problema porque las peticiones son diferentes: get y post
router.post('/add-product', (req,res,next)=>{
    console.log(req.body);
    //guardo los productos agregados creando un objeto nuevo y asignandole el titulo que se obtuvo del req
    products.push({title:req.body.title});
    res.redirect('/');
});

module.exports.router = router;
module.exports.products = products;