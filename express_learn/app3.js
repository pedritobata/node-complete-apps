var express = require('express')
var bodyParser = require('body-parser')

const app = express();

var adminRoutes = require('./routes/admin');
var shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended:false}));

// OJO que el orden en que pongo mis MWs sigue siendo importante!!
app.use(adminRoutes);
app.use(shopRoutes);




app.listen(3000);

