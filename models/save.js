import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var SaveSchema = new mongoose.Schema({
      entityId: {
        type: ObjectId,
        required: true,
      },
      type: {
        type: Number,
        required: true,
      },
      userId: {
        type: ObjectId,
        required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
      isRequested: {
        type: Boolean,
        default: false
      },
      accepted: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
      }
});

export default mongoose.model('save', SaveSchema);