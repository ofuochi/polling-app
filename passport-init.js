var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
const chalk = require('chalk');

var User = require('./models/user');
var UserController = require('./controllers/server/userController');

const logger = console.log;


module.exports = function(passport) {

  var userCtrl = new UserController();
  // var pollCtrl = new PollController();

  function log(text) {
    logger(chalk.inverse(text));
  }
  var isValidPassword = function(user, password) {
    return bCrypt.compareSync(password, user.password);
  };
  var createHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  };


  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function(user, done) {
    log('serializing user:' + user.id);
    return done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    userCtrl.getUserById(id, function(err, user) {
      if (err) return done(err);
      return done(null, user);
    });
  });


  passport.use('signup', new LocalStrategy({
      passReqToCallback: true //pass back the entire request to the callback
    },
    function(req, username, password, done) {

      userCtrl.getUserByUsername(username, function(err, user) {
        if (err) return done(err);
        if (user) {
          log('User already exists');
          return done(null, false, {
            message: 'User already exists'
          });
        }

        var newUser = new User({
          username: username,
          password: createHash(password),
          name: req.body.name,
          email: req.body.email,
          isAdmin: username === "./admin" && password === "./admin" ?
            true : false
        });
        userCtrl.createUser(newUser, function(err, newUser) {
          if (err) return done(err);
          log(username + ' Registration successful');
          return done(null, newUser);
        });

      });

    }));


  passport.use('login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {

      userCtrl.getUserByUsername(username, function(err, user) {
        if (err) return done(err);
        if (!user) {
          log('User Not Found with username ' + username);
          return done(null, false, {
            message: 'User Not Found with username ' + username
          });
        }
        if (!isValidPassword(user, password)) {
          log('Invalid password');
          return done(null, false, {
            message: 'Invalid password'
          });
        }
        return done(null, user);
      });


    }
  ));

};
