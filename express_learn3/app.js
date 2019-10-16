var express = require('express')
var bodyParser = require('body-parser')
const path = require('path');




const app = express();

var adminRouter = require('./routes/admin');
var shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

app.set('view engine','ejs');



app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')));

app.use('/admin',adminRouter);
app.use(shopRoutes);


app.use(errorController.get404);


app.listen(3000);

