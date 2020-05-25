const express = require('express');
const router = express.Router();
const axios = require('axios');

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const User = require("../models/user");
require('dotenv').config();

const webCamsApi = axios.create({
  baseURL: 'https://api.windy.com/api/webcams/v2/',
  timeout: 1000,
  headers: {
    'x-windy-key': 'RQlJ46jN1goFYopS9Jgln9igeqHVS1FL' //pr ocess.env.API_KEY
  }
});



//create a class for each state

// prevent default
router.post('/removeCamera', (req, res, next) => {
  const params = req.body.cameraid;
  var userID = req.session.currentUser._id
  console.log(params)
  console.log(userID)
  User.findByIdAndUpdate({
      _id: userID
    }, {
      $pull: {
        favorites: {
          $in: params
        }
      }
    }).then(
      res.redirect('favourites')
    )
    .catch(error => {
      console.log(error)
    })
})

router.post('/addCamera', (req, res, next) => {
  const params = req.body.cameraid;
  const currentUser = req.session.currentUser;
  console.log(params)
  User.findById(currentUser._id)
    .then(user => {
      user.favorites.push(params)
      return user.save()
    })
  res.redirect('/favourites');
})

router.get("/search", (req, res, next) => {
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }
  const countryCode = req.query.code;
  console.log(countryCode)
  webCamsApi.get(`list/country=${countryCode}?show:location,image,statistics`)
    .then(responseFromApi => {
      res.render("list-cameras", {
        responseFromApi,
        user: user
      })
    }).catch(error => {
      res.redirect("dashboard")
    })
});

router.get('/near-me', checkAuthenticated, (req, res, next) => {
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }
  User.findById(currentUser._id)
    .then(user => {
      res.render('near-me', {
          user: user
        })
      .catch((error) => {
        console.log(`${error} was found`)
      })
    })
  })

router.get('/favourites', checkAuthenticated, (req, res, next) => {
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }


  User.findById(currentUser._id)
    .then(user => {
      webCamsApi.get(`list/webcam=${user.favorites}?show=webcams:image,location,statistics`)
        .then(responseFromApi => {
          res.render('favorites', {
            responseFromApi,
            user: user
          })
        })
    })
    .catch((error) => {
      console.log(`${error} was found`)
    });
});


router.get('/most-popular', checkAuthenticated, (req, res, next) => {
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }

  User.findById(currentUser._id)
    .then(user => {
      webCamsApi.get('list/orderby=popularity,desc/limit=50&lang=en?show=webcams:image,statistics,location')
        .then(responseFromApi => {
          // console.log(responseFromApi.data.result.webcams[0])
          res.render('list-cameras', {
            responseFromApi,
            currentUser,
            user: user
          })
        })
        .catch((error) => {
          console.log(`${error} was found`)
        });
    })
});


router.get('/camera-player/:id', checkAuthenticated, (req, res, next) => {
  const cameraID = req.params.id;
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }

  User.findById(currentUser._id)
    .then(user => {
      webCamsApi.get(`list/webcam=${cameraID}?show=webcams:player`)
        .then(responseFromApi => {
          res.render('webcamPlayer', {
            responseFromApi,
            user: user
          });
        })
        .catch((error) => {
          console.log(`${error} was found`)
        })
    })
});


webCamsApi.get(`https://api.windy.com/api/webcams/v2/list`)
  .then(responseFromApi => {
    // console.log(responseFromApi.data.result.webcams[0])
    res.render('dashboard', {
      responseFromApi,
      currentUser
    })
  })
  .catch((error) => {
    // console.log(`${error} was found`)
  })

router.get('/', (req, res, next) => {
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }
  res.render('index', {
    currentUser
  });
});






//MAIN API CALLS START HERE:

router.get('/continents/:continent', checkAuthenticated, (req, res, next) => { //This route returns the list of countries based on the continent chosen by the user on the map
  const continent = req.params.continent;
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }

  User.findById(currentUser._id)
    .then(user => {
      webCamsApi.get(`https://api.windy.com/api/webcams/v2/list/continent=${continent}?show=countries`)
        .then(responseFromApi => {
          console.log(continent)
          console.log(responseFromApi.data.result.countries[0])
          res.render('countries', {
            responseFromApi,
            user: user
          })
        })
        .catch(error => {
          console.log(`${error} was found`);
        })
    })
})

router.get('/countries/:country', checkAuthenticated, (req, res, next) => { // This route returns the list of categories based on the country chosen by the user.
  const country = req.params.country;
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }

  User.findById(currentUser._id)
    .then(user => {
      webCamsApi.get(`https://api.windy.com/api/webcams/v2/list/country=${country}?show=categories;countries`)
        .then(responseFromApi => {
          console.log(country)
          console.log(responseFromApi.data.result.categories)
          console.log(responseFromApi.data.result.countries[0].id)
          res.render('categories', {
            responseFromApi: responseFromApi.data.result,
            currentUser,
            user: user
          })
        }).catch(error => {
          console.log(`${error} was found`);
        })
    })
})

router.get('/countries/:country/categories/:category', checkAuthenticated, (req, res, next) => {
  const country = req.params.country;
  const category = req.params.category;
  let currentUser;
  if (req.session) {
    currentUser = req.session.currentUser
  }

  User.findById(currentUser._id)
    .then(user => {
      webCamsApi.get(`https://api.windy.com/api/webcams/v2/list/country=${country}/category=${category}/orderby=popularity,desc/limit=50?show=countries;webcams:image,location,statistics`)
        .then(responseFromApi => {
          console.log(country)
          console.log(responseFromApi.data.result.categories)
          console.log(responseFromApi.data.result.countries[0].id)
          res.render('list-cameras', {
            responseFromApi,
            currentUser,
            user: user
          })
        })
    })
})

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