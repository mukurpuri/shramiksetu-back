import mongoose from 'mongoose';
var ObjectId = require('mongodb').ObjectID;

var HiddenBannerSchema = new mongoose.Schema({  
      userId: {
        type: ObjectId,
      },
      shopId: {
          type: ObjectId,
          required: true,
      },
      active: {
          type: Boolean,
          default: true
      },
      createdAt: {
        type: String,
        default: Date.now()
      }
});

export default mongoose.model('hideBanner', HiddenBannerSchema);