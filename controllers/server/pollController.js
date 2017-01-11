var Poll = require('../../models/poll');

function pollController() {
  this.createPoll = function(newPoll, callback) {
    newPoll.save(callback);
  };

  this.getPollById = function(id, callback) {
    Poll.findById(id).populate('votes').exec(callback);
  };

  this.getPollByQuestion = function(query, callback) {

  };

  this.getPolls = function(callback) {
    Poll.find({})
      .populate('votes').exec(callback);
  };

  this.deletePollById = function(id, callback) {
    Poll.findOneAndRemove({
      _id: id
    }, callback)
  };

  this.deletePolls = function(callback) {
    Poll.remove({}, callback);
  }

  this.updatePollStatusById = function(id, status, callback) {
    Poll.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        isActive: status
      }
    }, callback);
  };
  this.updatePollChoicesById = function(id, choices, callback) {
    Poll.findByIdAndUpdate(
      id,

      {
        $set: {
          'question.choices': choices
        }
      },

      {
        new: true
      },
      callback);
  };

  this.updatePollById = function(id, poll, callback) {
    Poll.findOneAndUpdate({
      _id: id
    }, {
      $set: poll
    }, {
      new: true
    }, callback);
  };
  this.updatePollVotesById = function(id, vote, callback) {
    Poll.findByIdAndUpdate(
      id,

      {
        $push: {
          "votes": vote
        }
      },

      {
        new: true
      }).select('question votes').exec(callback);
  };
}

module.exports = pollController;
