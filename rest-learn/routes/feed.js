const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const { body } = require('express-validator/check');

// GET /feed/posts
router.get('/posts', feedController.getPosts);

router.post('/post',
[
    body('title')
    .trim()
    .isLength({min: 7}),
    body('content')
    .trim()
    .isLength({min: 5})
] ,
feedController.createPost);

router.get('/post/:postId',feedController.getPost);



module.exports = router;