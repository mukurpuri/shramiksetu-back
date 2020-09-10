import mongoose from 'mongoose';
var ObjectId = require('mongodb').ObjectID;

var BannerSchema = new mongoose.Schema({  
      shopId: {
          type: ObjectId,
          required: true,
      },
      style: {
        type: Number,
        required: true,
      },
      imageId: {
        type: String,
      },
      text: {
          type: String,
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

export default mongoose.model('banner', BannerSchema);