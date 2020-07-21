import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var AnswerReactionSchema = new mongoose.Schema({  
      upVote: {
          type: Boolean,
      },
      downVote: {
        type: Boolean,
      },
      bookmark: {
        type: Boolean,
      },
      flag: {
        type: Boolean,
      },
      createdBy: {
          type: ObjectId,
          required: true,
      },
      answer: {
        type: ObjectId,
        required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
});

export default mongoose.model('answerReactions', AnswerReactionSchema);