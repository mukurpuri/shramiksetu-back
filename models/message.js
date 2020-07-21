const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
import moment from 'moment';

const MessageSchema = mongoose.Schema({
  primary: {
    type: ObjectId,
    required: true
  },
  secondary: {
    type: ObjectId,
    required: true
  },
  message: {
      type: String,
      required: true
  },
  isRead: {
      type: Boolean,
      required: true
  },
  createdAt: {
    type: String,
    default: Date.now()
},
});

export default mongoose.model("message", MessageSchema);