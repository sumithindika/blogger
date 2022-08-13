const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//@route  GET api/posts
//DESC create a post
//@access private
 
router.post('/',
 [
   auth,
  
  [
     
    check ('text','Text is required')
    .not()
    .isEmpty()
  
  
  ]
 ],

    async(req, res) => {
   const errors = validationResult(req);

   if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
   
}
    try {
      const user= await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    });

     const post = await newPost.save();
     res.json(post);



    } catch (err) {
      console.error(err.message);
     res.status(500).send("Server error.");
     }

});

// @route Get   api/posts
// DESC GET  a  all posts
// @access private

 router.get('/', auth, async (req, res) => {
   try {
     const posts = await Post.find().sort({ date: -1 });
     res.json(posts);
   } catch (err) {
     console.error(err.message);
     res.status(500).send('Server error.');
   }
 }),
   // @route Get   api/post:id
   // DESC GET  post by Id
   // @access Private

   router.get('/:id', auth, async (req, res) => {
     try {
       const post = await Post.findById(req.params.id);

       if (!post) {
         return res.status(404).json({ msg: 'Post not found..' });
       }
       res.json(post);
     } catch (err) {
       console.error(err.message);
       if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Post not found..' });
       }
       res.status(500).send('Server error.');
     }
   }),
   // @route delete   api/post/:id
   // DESC delete  a  post
   // @access private

   router.delete('/:id', auth, async (req, res) => {
     try {
       const post = await Post.findById(req.params.id);

       if (!post) {
         return res.status(404).json({ msg: 'Post not found..' });
       }

       //check user
       if (post.user.toString() !== req.user.id) {
         return res.status(401).json({ msg: 'User not Authorized' });
       }

       await post.remove();
       res.json({ msg: 'Post remove' });
     } catch (err) {
       console.error(err.message);
       if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Post not found..' });
       }
       res.status(500).send('Server error.');
     }
   }),
   // @route PUT api/posts/like:id
   // DESC like a  post
   // @access private

router.put('/like/:id',auth, async (req,res) => {
    try {
      const post = await Post.findById(req.params.id);


      // check if the post already have been liked

      if(post.likes.filter(like => like.user.toString() === req.user.id).length >  0){

    return res.status(400).json({msg:'post already liked'})
} 

   post.likes.unshift({user:req.user.id});

  await post.save();

  res.json(post.likes);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error')
      
    }
});

   // @route PUT api/posts/unlike:id
   // DESC  unlike a  post
   // @access private

router.put('/unlike/:id',auth, async (req,res) => {
    try {
      const post = await Post.findById(req.params.id);


      // check if the post already have been liked

      if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){

    return res.status(400).json({msg:'post have a not yet been liked'})
} 

   //Get remove index..
   const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

   post.likes.splice(removeIndex,1);

  await post.save();

  res.json(post.likes);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error')
      
    }
});



//@route Post  api/posts/comment/:id
//DESC comment on a post
//@access private
 
router.post('/comment/:id',
 [
   auth,
  
  [
     
    check ('text','Text is required')
    .not()
    .isEmpty()
  
  
  ]
 ],

    async(req, res) => {
   const errors = validationResult(req);

   if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
   
}
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

       const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    };

    post.comments.unshift(newComment);
      await post.save();
       res.json(post.comments);


    } catch (err) {
      console.error(err.message);
     res.status(500).send("Server error.");
     }

});



//@route Delete api/posts/comment/:id/:comment_id
//DESC delete  comment
//@access private

router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
try {
  
  const post = await Post.findById(req.params.id);
//pull out comment
const comment =post.comments.find(comment =>comment.id === req.params.comment_id);
// make sure comment exists
if(!comment){
return res.status(404).json({msg:"Comment des not exists"});
}
//check user
if(comment.user.toString() !==req.user.id){
  return res.status(401).json({msg:"Comment not Authorized"});
}

  //Get remove index..
  const removeIndex = post.comments
  .map(comment => comment.user.toString())
  .indexOf(req.user.id);
     post.comments.splice(removeIndex,1);
    await post.save();
     res.json(post.comments);

} catch (err) {
  console.error(err.message);
     res.status(500).send("Server error.");
}

});

   module.exports = router;
