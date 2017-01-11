var User = require("../../models/user");

function userController() {
  this.createUser = function(newUser, callback) {
    User.create(newUser, callback);
  };
  this.getUserByUsername = function(username, callback) {
    User.findOne({
        username: username
      })
      .populate('polls', '_id')
      .exec(callback);
  };

  this.getUserById = function(id, callback) {
    User.findById(id, callback);
  };
  this.getUserBySerialNumber = function(serialNumber, callback) {
    var query = {
      serialNumber: serialNumber
    };
    User.findOne(query, callback);
  };
  this.populateUserVotes = function(id, callback) {
    User.findOne({
      _id: id
    }).populate('votes').exec(callback);
  };
}

module.exports = userController;
