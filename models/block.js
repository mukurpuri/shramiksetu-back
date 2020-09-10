import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var BlockSchema = new mongoose.Schema({  
      createdBy: {
          type: ObjectId,
          required: true,
      },
      type: {
        type: Number,
        required: true,
      },
      entityId: {
        type: ObjectId,
        required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
});

export default mongoose.model('block', BlockSchema);