import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var QuestionSchema = new mongoose.Schema({  
      title: {
          type: String,
          required: true,
      },
      description: {
        type: String,
      },
      votes: {
          type: Number,
          default: 0
      },
      createdBy: {
          type: ObjectId,
          required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
      area: {
        type: String,
      },
      endedAt: {
        type: String,
        default: null
      },
      categories: {
        type: []
      },
      medias : {
        type: []
      }
});

export default mongoose.model('questions', QuestionSchema);