require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

mongoose
  .connect(process.env.MLAB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    // console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

//register helper
hbs.registerHelper('get', function (obj, prop) {
  return obj[prop];
});
hbs.registerHelper('isFavorite', (cameraId, userList) => {
  console.log(userList);
  userList.forEach((element) => {
    if (element === cameraId) {
      console.log('already a favorite');
      return true
    }
  });
  return false;
});

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Setup authentication session
app.use(session({
  secret: "wilsco-session",
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    resave: true,
    saveUninitialized: false,
    ttl: 24 * 60 * 60 // session living on the server - 1day
  })
}));

// Express View engine setup

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
hbs.registerPartials(path.join(__dirname, 'views/partials'))



// default value for title local
app.locals.title = `Wilsco - The world's largest collection of live cameras`;





const userRoutes = require('./routes/user-routes');
app.use('/', userRoutes);

const index = require('./routes/index');
app.use('/', index);

const siteRoutes = require('./routes/site-routes');
app.use('/', siteRoutes);

module.exports = app;