var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      trim: true,
      index: true,
      require: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      trim: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    polls: {
      type: Array
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
