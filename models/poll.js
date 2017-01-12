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
      type: Array,
      required: true
    }
  },

  expiry_date: {
    type: Date,
    default: function() {
      return +new Date() + 1 * 24 * 60 * 60 * 1000
    }
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
