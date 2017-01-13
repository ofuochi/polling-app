var Vote = require('../../models/vote');


function voteController() {
  this.createVote = function(newVote, callback) {
    newVote.save(callback);
  };

  this.getVoteById = function(id, callback) {
    Vote.findById(id, '-__v').populate('_poll _voter').exec(callback);
  };
  this.getVote = function(voterId, pollId, callback) {
    Vote.findOne({
      _voter: voterId,
      _poll: pollId
    }, '-__v', callback);
  };
  this.getVotes = function(callback) {
    Vote.find({}, '-__v').populate('_poll _voter').exec(callback);
  };


  this.deleteVotes = function(callback) {
    Vote.remove({}, callback);
  };
  this.deleteVoteById = function(id, callback) {
    Vote.findByIdAndRemove(id, callback);
  };

  this.updateVoteById = function(id, vote, callback) {
    Vote.findOneAndUpdate({
      _id: id
    }, {
      $set: vote
    }, {
      new: true
    }, callback);
  };
}

module.exports = voteController;
