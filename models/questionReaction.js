import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var QuestionReactionSchema = new mongoose.Schema({  
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
      question: {
        type: ObjectId,
        required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
});

export default mongoose.model('questionReactions', QuestionReactionSchema);