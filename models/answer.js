import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var AnswerSchema = new mongoose.Schema({  
      text: {
          type: String,
          required: true
      },
      votes: {
        type: Number,
        default: 0
      },
      medias : {
          type: []
      },
      createdBy: {
          type: ObjectId,
          required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
      questionId: {
          type: ObjectId,
          required: true
      },
      endedAt: {
        type: String,
        default: null
      }
});

export default mongoose.model('Answer', AnswerSchema);