var express = require('express');
var router = express.Router();

module.exports = function(passport) {

  //sends successful login state back to angular
  router.get('/success', function(req, res) {
    res.json({
      state: 'success',
      user: req.user ? req.user : null,
      message: req.flash()
    });
  });

  //sends failure login state back to angular
  router.get('/failure', function(req, res) {
    res.json({
      state: 'failure',
      user: null,
      message: req.flash()
    });
  });

  //log in
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure',
    failureFlash: true
  }));

  //sign up
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure',
    failureFlash: true,
    successFlash: 'Successfully registered, you may login now'
  }));

  //log out
  router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  //check user
  router.get('/check', function(req, res) {
    res.json(req.user);
  });
  return router;

};
