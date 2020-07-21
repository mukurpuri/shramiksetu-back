import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var Areas = new mongoose.Schema({  
      city: {
        type: ObjectId,
      },
      name: {
        type: String,
        },
      isActive: {
        type: Boolean,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
});

export default mongoose.model('areas', Areas);