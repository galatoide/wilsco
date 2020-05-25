const express = require('express');
const router = express.Router();
const axios = require('axios');

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");

// const webCamsApi = axios.create({
//   baseURL: 'https://api.windy.com/api/webcams/v2/',
//   timeout: 1000,
//   headers: {
//     'x-windy-key': process.env.API_KEY
//   }
// });

// router.get('/dashboard', (req, res, next) => {
//   webCamsApi.get('/list/continent=EU')
//     .then(data => {
//       console.log(data)
//       res.render('dashboard', {
//         data
//       })

//     })
//     .catch((error) => {
//       console.log(`${error} was found`)
//     })

//   ;
// });

// Auth

router.get("/signup", checkNotAuthenticated, (req, res, next) => {
  try {
    res.render("../views/signup.hbs");
  } catch (e) {
    next(e);
  }
});

router.get("/", checkNotAuthenticated, (req, res, next) => { //login
  try {
    res.render("index");
  } catch (e) {
    next(e);
  }
});

router.get("/logout", checkAuthenticated, (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
    console
  });
});

router.get('/dashboard', checkAuthenticated, (req, res, next) => {
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }
  console.log('TESTING::: ', currentUser)
  console.log('SESSION:::', req.session)

  User.findById(currentUser._id)
    .then(user => {
    res.render('dashboard', {
      user:user
    })
  })

  router.use((req, res, next) => {
    if (req.session.currentUser) {
      next(); // ------------------------
    } else { // |
      res.redirect('/dashboard'); // |
    }
  }); // |    
})

router.post("/dashboard", (req, res, next) => { //login
  const {
    username,
    password,
    email,
    gender
  } = req.body;

  // if (username && password){
  //   console.log('WORKED!!!')
  // }

  if (!username || !password) {
    res.render("index", {
      errorMessage: "Please enter both, username and password to login"
    });

    return;
  }

  User.findOne({
      "username": username
    })
    .then(user => {
      if (!user) {
        res.render("index", {
          errorMessage: "The username doesn't exit"
        });

        return;
      }

      if (bcrypt.compareSync(password, user.password)) {
        console.log('users authenticated');
        req.session.currentUser = user;

        if (req.session.currentUser) {
          // do something for authenticated user
        } else {
          // hide stuff from anonymous users
        }

        res.redirect("dashboard");
      } else {
        res.render("index", {
          errorMessage: "Incorrect password"
        });
      }
    });
});

router.post("/signup", (req, res, next) => {
  const {
    username,
    password,
    email,
    gender
  } = req.body;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }

  // const isPasswordOk = password.match(/[A-Z]/g);
  // if (!isPasswordOk) {
  // }

  // Making sure username, email and password are not empty
  if (username === "" || email === "" || password === "") {
    res.render("../views/signup.hbs", {
      errorMessage: "Indicate a name, email and password"
    });
    return;
  }

  // Making sure that user doesn't exist already
  User.findOne({
      "email": email
    })
    .then(user => {
      if (user) {
        res.render("../views/signup.hbs", {
          errorMessage: "The email already exists"
        });
        return;
      }

      User.create({
          username,
          email,
          password: hashPass,
          gender
        })
        .then(() => {
          // res.redirect("/dashboard");
          res.render("index", {
            errorMessage: "Insert your login data"
          });
        })
        .catch(error => {
          next(error);
        });
    });
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

module.exports = router;