
exports.getPosts = (req,res,next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: "First Post",
                content: "This is my first post with REST!!",
                creator: { name: 'Perico' },
                createdAt: new Date(),
                imageUrl: ''
            }
        ]
    });
};

exports.createPost = (req,res,next) => {
    const title = req.body.title;//el body ya lo agrega el MW del bodyparser al request
    const content = req.body.content;
    /* logica para crear post en la BD
        ////
    */

    res.status(201).json({
        message: "Post created successfully",
        post: {
            id: new Date().toISOString(), 
            title: title, 
            content: content,
            creator: {name: 'fernandillo'},
            createdAt: new Date()
        }
    });
};