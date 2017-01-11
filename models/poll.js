'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pollSchema = new Schema({

  question: {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    choices: {
      type: Array
    }
  },

  expiry_date: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: false
  },
  votes: [{
    type: Schema.Types.ObjectId,
    ref: 'Vote'
  }]

}, {
  timestamps: true
});

module.exports = mongoose.model('Poll', pollSchema);
