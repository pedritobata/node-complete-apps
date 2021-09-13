const { validationResult } = require('express-validator/check');

exports.getPosts = (req, res, next) => {
    const posts = [
        {
            _id: '1',
            creator: {
                name: 'Perico Martinez'
            },
            createdAt: new Date(),
            title: 'First Post',
            imageUrl: '',
            content: 'This is my first dummy post. Hope you enjoy it'
        }
    ]
    res.json({posts, totalitems: posts.length});
}

exports.createPost = (req, res, next) => {
    console.log('New post', req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json({message: 'Invalid post data', errors: errors.array()});
    }
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json(
        {
            post: {
                _id: '2',
                title,
                content,
                creator: {name: 'Yerbita'},
                createdAt: new Date()
            }
           
        }
    )
}