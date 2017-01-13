'use strict';

var express = require('express');
var router = express.Router();

var PollController = require('../controllers/server/pollController');
var VoteController = require('../controllers/server/voteController');

var Poll = require('../models/poll');
var Vote = require('../models/vote');

// router.use(function(req, res, next) {
//   if (req.method === "GET") {
//     return next();
//   }

//   if (!req.isAuthenticated()) {
//     console.log("User not authenticated");
//     var fullUrl = req.get('host') + '/#/login';
//     return res.redirect(500, fullUrl);
//   }
//   return next();
// });

router.use('/polls', function(req, res, next) {
  if ((req.method !== "GET" && req.method !== 'PUT') &&
    !req.user.isAdmin) {
    return res.status(500).send("User not authorized");
  }
  return next();
});
var pollCtrl = new PollController();
var voteCtrl = new VoteController();

router.route('/polls')
  .get(function(req, res) {
    pollCtrl.getPolls(function(err, polls) {
      if (err) return res.status(500).send(err);
      console.log('getting polls');

      res.json(polls);
    });
  })
  .post(function(req, res) {
    if (req.body.question.text === "")
      return res.status(400).send("Question is required");

    if (req.body.question.choices[0].text.trim() === "" ||
      req.body.question.choices[1].text.trim() === "") {
      return res.status(400).send("At least two choices are required");
    }
    if (!req.body.expiry_date)
      return res.status(400).send("Expiry date is required");
    if ((new Date(req.body.expiry_date)) <= (new Date()))
      return res.status(400).send("Poll is expired!");

    var newPoll = new Poll();
    newPoll.question.text = req.body.question.text;
    newPoll.question.choices = req.body.question.choices;
    newPoll.expiry_date = req.body.expiry_date;
    pollCtrl.createPoll(newPoll, function(err, poll) {
      if (err) return res.status(500).send(err);
      res.json(poll);
      res.io.emit('server:createPoll', {
        poll: poll
      });
      console.log('Poll created successfully');
    });
  })
  .delete(function(req, res) {
    pollCtrl.deletePolls(function(err, count) {
      if (err) return res.status(500).send(err);
      res.io.emit('server:deleteAll', count);
      res.status(200).send(count);
      console.log('Polls deleted: ' + count);
    });
  });

router.route('/polls/:id')
  .get(function(req, res) {
    pollCtrl.getPollById(req.params.id, function(err, poll) {
      if (err) return res.status(500).send(err);
      res.json(poll);
      console.log('Getting poll ' + poll._id);
    });
  })
  .delete(function(req, res) {
    pollCtrl.deletePollById(req.params.id, function(err, resp) {
      if (err) return res.status(500).send(err);

      res.status(200).send(resp);
      res.io.emit('server:deleteOne', {
        index: req.body.index
      });
      console.log('Deleted poll ' + resp._id);
    });
  })
  .put(function(req, res) {


    if (req.body.isChoice) {
      pollCtrl.updatePollChoicesById(
        req.params.id,
        req.body.choices,
        function(err, data) {
          if (err) return res.status(500).send(err);
          res.io.emit('server:updateChoices', {
            poll: data,
          });
          res.status(200).send(data);
        });
    }
    else {
      if (req.body.poll.question.text === "")
        return res.status(400).send("Question is required");

      if (req.body.poll.question.choices[0].text.trim() === "" ||
        req.body.poll.question.choices[1].text.trim() === "") {
        return res.status(400).send("At least two choices are required");
      }
      if (!req.body.poll.expiry_date)
        return res.status(400).send("Expiry date is required");
      if ((new Date(req.body.poll.expiry_date)) <= (new Date()))
        return res.status(400).send("Poll is expired!");
      pollCtrl.updatePollById(
        req.params.id,
        req.body.poll,
        function(err, data) {
          if (err) return res.status(500).send(err);
          res.io.emit('server:updateOne', {
            poll: data,
            index: req.body.index
          });
          res.status(200).send(data);
        });
    }
  });

router.route('/votes')
  .get(function(req, res) {
    voteCtrl.getVotes(function(err, votes) {
      if (err) return res.status(500).send(err);
      console.log('Getting votes');
      res.json(votes);
    });
  })
  .post(function(req, res) {

    voteCtrl.getVote(req.body._user, req.body._poll,
      function(err, vote) { //check if user already voted
        if (err) {
          res.status(500).send("Can't verify vote");
          throw err;
        }
        if (vote !== undefined && vote !== null &&
          Object.keys(vote).length > 0) { //User has voted before
          return res.status(403).send("User already voted");
        }
        //User has not previously voted on the same poll
        var newVote = new Vote({ //vote object
          _voter: req.body._user,
          choice: req.body.choice,
          _poll: req.body._poll
        });

        voteCtrl.createVote(newVote, function(err, vote) {
          if (err) {
            res.status(500).send("Error while registering vote");
            throw err;
          }

          //Vote has been created but not updated here
          console.log("vote created");

          let promise = new Promise(function(resolve, reject) {
            pollCtrl.getPollById(vote._poll, function(err, poll) {
              if (err) throw err;
              if (poll.expiry_date < new Date()) { //poll is expired
                resolve(vote);
              }
              else { // poll is not expired
                reject(vote);
              }

            });
          });

          promise.then(function(vote) {
            //remove vote on expired poll
            voteCtrl.deleteVoteById(vote._id, function(err, info) {
              if (err) throw err;
              console.log('vote removed due to expired poll');
              res.status(400).send("Poll is expired!");
            });
          }, function(vote) {
            pollCtrl.updatePollVotesById(
              req.body._poll,
              vote._id,
              function(err, poll) { //vote has been created and about to be updated
                if (err) {
                  voteCtrl.deleteVoteById(vote._id, function(err1, info) {
                    if (err1) throw err1;
                    console.log("vote removed due to internal error");
                    res.status(500).send("ERROR: Vote not registered!");
                    throw err;
                  });
                }
                console.log("vote successfully registered on poll");
                res.status(200).json(poll);
              });
          });


        });

      });
  });

router.route('/votes/:id')
  .post(function(req, res) {
    voteCtrl.getVote(req.params.id, req.body._poll, function(err, vote) {
      if (err) throw err;
      res.json(vote);
    });
  });
module.exports = router;
