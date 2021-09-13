const { validationResult } = require("express-validator/check");
const PostModel = require("../models/post");

exports.getPosts = (req, res, next) => {
  const posts = [
    {
      _id: "1",
      creator: {
        name: "Perico Martinez",
      },
      createdAt: new Date(),
      title: "First Post",
      imageUrl: "",
      content: "This is my first dummy post. Hope you enjoy it",
    },
  ];
  res.json({ posts, totalitems: posts.length });
};

exports.createPost = (req, res, next) => {
  console.log("New post", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({ message: "Invalid post data", errors: errors.array() });
  }
  const title = req.body.title;
  const content = req.body.content;
  const newPost = new PostModel({
    title,
    content,
    imageUrl: "some/random/url.jpeg",
    creator: { name: "Periquito" },
  });
  newPost
    .save()
    .then((result) => {
      res.status(201).json({
        post: result,
      });
    })
    .catch((err) => console.log("Could not save the Post to DB", err));
};
