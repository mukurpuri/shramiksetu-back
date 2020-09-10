import mongoose from 'mongoose';
var ObjectId = require('mongodb').ObjectID;


/* Message Type
1. Text
2. Image
3. Video
4. Youtube video
*/
var ConversationSchema = new mongoose.Schema({  
    sender: {
        type: ObjectId,
        required: true,
    },
    receiver: {
      type: ObjectId,
      required: true,
    },  
    type: {
          type: Number,
          required: true,
      },
      text: {
        type: String,
      },
      media: {
          type: String,
      },
      createdAt: {
          type: String,
      },
      status: {
        type: String,
        default: "sent"
      }
});

export default mongoose.model('conversation', ConversationSchema);