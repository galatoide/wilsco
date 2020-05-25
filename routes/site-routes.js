const express = require('express');
const router = express.Router();
const Avatar = require('../models/user');
const uploadCloud = require('../config/cloudinary')
const User = require('../models/user');

router.get('/account', checkAuthenticated, (req, res, next) => {
    // const { username, password, email } = req.body
    let currentUser;
    if (req.session) {
      currentUser = req.session.currentUser
      }
    User.findById(currentUser._id)
      .then(user => {
        res.render('account', {
          user: user
        });
      });
    // res.render('account', { user });
    // try{
    //   res.render("../views/account")
    // } catch(e){
    //   next(e);
    // }
});

function checkAuthenticated(req, res, next) {
    if (req.session.currentUser) {
      return next();
    //   console.log('TESTING::: ',currentUser)
    // console.log('SESSION:::' ,req.session)
    }
      res.redirect("/");
}

function checkNotAuthenticated(req, res, next) {
    if (req.session.currentUser) {
      return res.redirect('/dashboard')
    }
      next()
}

router.post("/account", uploadCloud.single('photo'), (req, res, next) => {
    let currentUser;
    if (req.session) {
      currentUser = req.session.currentUser
    }
    // User.findById(_id)
    //   .then((account)=>{
    //   })
    const imgPath = req.file.url;
    const imgName = req.file.originalname;
    // const newAvatar= new Avatar({imgPath, imgName})
    // newAvatar.save()
    console.log(User)
    const userID = {
      _id: currentUser._id
    };
    // const form = { username: req.body.username, email: req.body.email, gender: req.body.gender };
    const username = req.body.username;
    const email = req.body.email
    User.findByIdAndUpdate(userID, {
        $set: req.body,
        imgName,
        imgPath
      }, {
        upsert: true,
        new: true
      })
      .then(() => {
        if (imgPath === '') {
          imgPath = 'https://res.cloudinary.com/dffhqdktj/image/upload/v1590003435/Wilsco/default-avatar.png'
        }
        console.log(currentUser)
        res.redirect('/account');
      })
      .catch((error) => {
        console.log(error);
        next(error);
      })
});

module.exports = router;