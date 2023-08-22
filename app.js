var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookie = require('cookie-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const projectRoute = require('./routes/projectRoute');

var app = express();
dotenv.config();

mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(session({
    secret: 'session-secret',
    resave: true,
    saveUninitialized: true
}));
app.use(cookie('session-secret'));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done)=>{
    User.findOne({email: username}, (err, user)=>{
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'Email does not exist'});
        }
        bcrypt.compare(password, user.password, (err, result)=>{
            if(err) throw err;
            if(result){
                return done(null, user);
            }else{
                
                return done(null, false, {message: 'Wrong email or password'});
            }
        });
    });
}));



passport.serializeUser((user, cb) => {
    cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id }, (err, user) => {
      cb(err, user);
    });
});

app.use('/api', authRoute);
app.use('/api', userRoute);
app.use('/api', projectRoute);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
