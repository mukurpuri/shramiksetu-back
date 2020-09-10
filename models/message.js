import mongoose from 'mongoose';
var ObjectId = require('mongodb').ObjectID;

var MessageSchema = new mongoose.Schema({  
      participants: {
        type: [String],
        required: true,
      },
      conversationID: {
        type: ObjectId,
        required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
      isRead: {
          type: Boolean,
      }
});

export default mongoose.model('messages', MessageSchema);