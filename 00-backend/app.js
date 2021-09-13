const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const feedRoutes = require('./routes/feed.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/feed', feedRoutes);

// Mongo DB
mongoose.connect('mongodb+srv://cluster0.rw1t7.mongodb.net/messages?retryWrites=true&w=majority', {
      "user": "pedro",
      "pass": "R@tamacue1",
      useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(result => {
    app.listen(8080, () => console.log('Server running...'))
}).catch(err => console.log('Error connecting to Mongo', err))

