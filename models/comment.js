import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

// type: {
//   0 -> for QA
// }

var CommentSchema = new mongoose.Schema({
      type: {
        type: Number,
        required: true,
      },
      postId: {
        type: ObjectId,
        required: true,
      },
      text: {
          type: String,
          required: true,
      },
      media: {
          type: [String],
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
          default: moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')
      },
      endedAt: {
        type: String,
        default: null
      },
      tags: {
          type: [String],
          default: []
      },
      rate: {
        type: Number,
        default: 0
      }
});

export default mongoose.model('Comment', CommentSchema);