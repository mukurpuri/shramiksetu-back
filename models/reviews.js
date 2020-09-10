import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var ReviewsSchema = new mongoose.Schema({  
      text: {
          type: String,
      },
      stars: {
        type: Number,
        required: true,
      },
      createdBy: {
          type: ObjectId,
          required: true,
      },
      type: {
        type: Number,
        required: true,
      },
      parentId: {
        type: ObjectId,
        required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
});

export default mongoose.model('reviews', ReviewsSchema);