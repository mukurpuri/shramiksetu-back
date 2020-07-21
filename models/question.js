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
      isAnswered: {
        type: Boolean,
        default: false
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
      views: {
        type: []
      },
      medias : {
        type: []
      }
});

export default mongoose.model('questions', QuestionSchema);