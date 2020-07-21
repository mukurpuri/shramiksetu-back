const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
import moment from 'moment';

/*
    1. Answer to question
    2. Upvoted your question
    3. Upvoted your answer
    
*/

const NotificationSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  type: {
    type: Number,
    required: true
  },
  postId: {
    type: ObjectId,
    required: true
  },
  postTitle: {
    type: String,
    required: true
  },
  postOwner: {
    type: ObjectId,
    required: true
  },
  engagementBy: {
    type: ObjectId,
    required: false
  },
  engagerName: {
    type: String,
  },
  isRead: {
      type: Boolean,
      default: false
  },
  createdAt: {
    type: String,
    default: Date.now()
},
});

export default mongoose.model("notification", NotificationSchema);