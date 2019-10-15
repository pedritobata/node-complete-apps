var express = require('express')
var bodyParser = require('body-parser')
const path = require('path');




const app = express();

var adminData = require('./routes/admin');
var shopRoutes = require('./routes/shop');

app.set('view engine','ejs');



app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')));

app.use('/admin',adminData.router);
app.use(shopRoutes);


app.use((req,res,next)=>{
    res.status(404).render('404', {pageTitle:'Page Not Found', path:''});
})


app.listen(3000);

