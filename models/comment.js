import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

// type: {
//   0 -> for QA
// }

var CommentSchema = new mongoose.Schema({
      postId: {
        type: ObjectId,
        required: true,
      },
      text: {
          type: String,
          required: true,
      },
      votes: {
          type: [ObjectId],
          default: []
      },
      createdBy: {
          type: ObjectId,
          required: true,
      },
      createdAt: {
          type: String,
          default: new Date()
      },
      endedAt: {
        type: String,
        default: null
      }
});

export default mongoose.model('Comment', CommentSchema);