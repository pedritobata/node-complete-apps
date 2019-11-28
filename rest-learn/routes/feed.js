const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');
const { body } = require('express-validator/check');
const isAuth = require('../middleware/is-auth');

// GET /feed/posts
router.get('/posts',isAuth, feedController.getPosts);

router.post('/post',
isAuth,
[
    body('title')
    .trim()
    .isLength({min: 5}),
    body('content')
    .trim()
    .isLength({min: 5})
] ,
feedController.createPost);

router.get('/post/:postId',isAuth,feedController.getPost);

//los metodos http pueden tener body y query params
//excepto get, que solo tiene query params y NO body
router.put('/post/:postId',
isAuth,
[
    body('title')
    .trim()
    .isLength({min: 5}),
    body('content')
    .trim()
    .isLength({min: 5})
]
,feedController.putPost);


router.delete('/post/:postId', isAuth,feedController.deletePost);



module.exports = router;