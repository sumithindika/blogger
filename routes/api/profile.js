const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');



const {
    check,
    ValidateResult,
    validationResult,
    body,
  } = require('express-validator');
  const { route } = require('express/lib/router');
  const { response } = require('har-validator');
  
  //@route GET api/profile/me
  //DESC get current user Profile
  //@access private
  
  router.get('/me', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id }).populate(
        'user',
        ['name', 'avatar']
      );
  
      if (!profile) {
        return res.status(400).json({ msg: 'there is no Profile for this user' });
      }
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  //@route Post api/profile
  //DESC create and update  user Profile
  //@access private
  
  router.post(
    '/',
    [
      auth,
      [
        check('status', 'status is required').not().isEmpty(),
  
        check('skills', 'skills is required').not().isEmpty(),
      ],
    ],
  
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
         facebook,
        twitter,
       linkedin,
      } = req.body;
  
      //Build profile object .....
  
      const profileFields = {};
  
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
  
      if (skills) {
        profileFields.skills = skills.split(',').map((skills) => skills.trim());
      }
      //build social object .....
      profileFields.social = {};
  
     
      if (facebook) profileFields.social.facebook = facebook;
      if (twitter) profileFields.social.twitter = twitter;
      if (linkedin) profileFields.social.linkedin = linkedin;
 
  
      try {
        let profile = await Profile.findOne({ user: req.user.id });
  
        if (profile) {
          //update
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          );
          return res.json(profile);
        }
  
        //create....
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      } catch (err) {
        console.error(err.massage);
        res.status(500).send('server error..');
      }
      //console.log(profileFields.skills);
      // res.send('hello');
    }
  );
  
  //get all profile
  
  //@route Get api/profile
  //DESC get all profile ..
  //@access public
  
  router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      //console.log(profiles);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error....');
    }
  });
  
  //@route Get api/profile/user/:user_id
  //DESC get  profile by user_id
  //@access public
  
  router.get('/user/:user_id', async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.params.user_id,
      }).populate('user', ['name', 'avatar']);
      if (!profile)
        return res.status(400).json({ msg: 'profile not found this user' });
      //console.log(profiles);
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {   // user id not match ?
        return res.status(400).json({ msg: 'Profile not found ...' });
      }
      res.status(500).send('Server Error....');
    }
  });
  
  //@route Delete request API/Profile
  //DESC delete  profile ,user & posts
  //@access Private
  
  router.delete('/', auth, async (req, res) => {
    try {
      //  - : remove users  posts
      await Post.deleteMany({ user: req.user.id });
      // remove  profile
      await Profile.findOneAndRemove({ user: req.user.id });
      //remove user
      await User.findOneAndRemove({ _id: req.user.id });
  
      res.json({ msg: 'User deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error....');
    }
  });
  
  //@route put request API/Profile/experience  put method using
  //DESC add profile experience
  //@access Private
  router.put(
    '/experience',
    [
      auth,
      [
        check('title', 'title is required').not().isEmpty(),
        check('company', 'company is required').not().isEmpty(),
        check('from', 'from date is required').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const error = validationResult(req);
      if (!error.isEmpty) {
        return req.status(400).json({ error: error.array() });
      }
  
      const { title, company, location, from, to, current, description } =
        req.body;
  
      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
      } catch (err) {
        console.error(err.massage);
        res.status(500).send('server error');
      }
    }
  );
  
  //@route put request delete API/Profile/experience/exp_id..
  //DESC add profile experience /delete from profile
  //@access Private
  
  router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id }); //get user
      //get remove index.
      const removeIndex = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);
  
      //splice out
      profile.experience.splice(removeIndex, 1);
  
      //save
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(err.massage);
      res.status(500).send('server error');
    }
  });
  
  //education /
  
  //@route put request API/Profile/education
  //DESC add profile experience
  //@access Private
  router.put(
    '/education',
    [
      auth,
      [
        check('school', 'school is required').not().isEmpty(),
        check('degree', 'degree is required').not().isEmpty(),
        check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
        check('from', 'from date is required').not().isEmpty(),
      ],
    ],
    async (req, res) => {
      const error = validationResult(req);
      if (!error.isEmpty) {
        return req.status(400).json({ error: error.array() });
      }
  
      const { school, degree, fieldofstudy, from, to, current, description } =
        req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
      } catch (err) {
        console.error(err.massage);
        res.status(500).send('server error');
      }
    }
  );
  //@route put request delete API/Profile/education/edu_id..
  //DESC add profile education /delete from profile
  //@access Private
  
  router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id }); //get user
      //get remove index.
      const removeIndex = profile.education
        .map((item) => item.id)
        .indexOf(req.params.edu_id);
  
      //splice out
      profile.education.splice(removeIndex, 1);
  
      //save
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(err.massage);
      res.status(500).send('server error');
    }
  });
  
  //GET  API/Profile/github/:username(sumithindika)
  //DESC get user repos from github
  //@access Public
  
  router.get('/github/:username', (req, res) => {
    try {
      const options = {
        //uri: 'https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&//client_id=${config.get("githubClientId")}&client_secret=${config.get("githubSecret")}',
  
        uri: `https://api.github.com/users/${
          req.params.username
        }/repos?per_page=5&sort=created:asc&
                    client_id=${config.get(
                      'githubClientId'
                    )}&client_secret=${config.get('githubSecret')}`,
  
        method: 'GET',
        headers: { 'user-agent': 'node.js' },
      };
  
      request(options, (error, response, body) => {
        if (error) console.error(error);
        if (response.statusCode !== 200) {
         return res.status(404).json({ msg: 'No github profile found... ' });
        }
        res.json(JSON.parse(body));
      });
    } catch (err) {
      console.error(err.massage);
      res.status(500).send('server error');
    }
  });
  
  module.exports = router;
  