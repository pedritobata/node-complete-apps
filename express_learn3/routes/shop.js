const express = require('express')

const path = require('path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req,res,next)=>{
    console.log('shop.js', adminData.products);
    //sendFile usa rutas ABSOLUTAS, para eso uso path y __dirname
    //__dirname contiene la ruta absoluta hasta el file en el que estamos actualmente
    //luego hay que concatenar rutas hasta llegar a donde se desea
    //res.sendFile(path.join(__dirname,'..','views','shop.html'));

    //usando pug:
    //solo render porque ya se configuraron las variables globales con app.set()
    //en el segundo parametro envio un objeto con las params que quiera enviar a la vista!!
   res.render('shop', {prods: adminData.products, pageTitle: 'Shop', path: '/', 
              hasProducts: adminData.products.length > 0, activeShop:true, productCSS:true});
});

module.exports = router;