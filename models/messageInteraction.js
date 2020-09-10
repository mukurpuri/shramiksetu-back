import mongoose from 'mongoose';
var ObjectId = require('mongodb').ObjectID;

var MessageInteractionSchema = new mongoose.Schema({  
    userId: {
        type: ObjectId,
        required: true,
    },
    with: {
      type: [String],
      required: true,
    },
});

export default mongoose.model('messageInteraction', MessageInteractionSchema);