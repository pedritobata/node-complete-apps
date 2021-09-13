const express = require('express');
const feedController = require('../controllers/feed.controller');
const { body } = require('express-validator/check');

const router = express.Router();


router.get('/posts', feedController.getPosts);

router.post('/post', [
    body('title').trim().isLength({min: 7})
] , feedController.createPost);

module.exports = router;