var mongoose = require('mongoose');

var groupShema = new mongoose.Schema({
  members: [String]
});

module.exports = mongoose.model("group",groupShema);