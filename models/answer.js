import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var AnswerSchema = new mongoose.Schema({  
      text: {
          type: String,
          required: true
      },
      votes: {
          type: [ObjectId]
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
          default: moment(new Date()).format('MMMM Do YYYY, h:mm:ss a')
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