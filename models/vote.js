'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({

  _voter: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  _poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll'
  },
  choice: {
    _id: {
      type: Number
    },
    text: {
      type: String
    },
    count: {
      type: Number,
      default: 0
    }
  }

});

module.exports = mongoose.model('Vote', voteSchema);
