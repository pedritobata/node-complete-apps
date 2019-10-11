var express = require('express')
const path = require('path')

const router = express.Router();

const rootDir = require('../util/path');

//uso el utilitario rootDir que creé
router.get('/add-product', (req,res,next)=>{
   res.sendFile(path.join(rootDir,'views','add-product.html'));
});


//notar que uso el mismo path que la ruta anterior
// eso no es problema porque las peticiones son diferentes: get y post
router.post('/add-product', (req,res,next)=>{
    console.log(req.body);
    res.redirect('/');
});

module.exports = router;