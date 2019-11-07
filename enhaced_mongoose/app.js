const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5dc43f609912b105223839db')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
.connect('mongodb+srv://cluster0-rw1t7.mongodb.net/shop?retryWrites=true&w=majority',{
  user: 'pedro',
  pass: 'R@tamacue1'
})
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'perico',
          email: 'perico@hotmail.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    console.log('Connected through Mongoose!!!');
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
