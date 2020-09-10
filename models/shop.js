import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var ShopSchema = new mongoose.Schema({  
      name: {
          type: String,
          required: true
      },
      about: {
        type: String,
      },
      imageID: {
        type: String,
      },
      lat: {
        type: String,
        required: true
      },
      lng: {
        type: String,
        required: true
      },
      address: {
        type: String,
      },
      createdBy: {
          type: ObjectId,
          required: true,
      },
      createdAt: {
          type: String,
          default: Date.now()
      },
      phoneNumber: {
          type: String,
      },
      isVerified: {
          type: Boolean,
          default: false
      },
      category: {
          type: [String],
          required: true
      },
      contacts: {
        type: [String]
      },
      isOpen: {
          type: Boolean,
      },
      shopTags: {
          type: Number,
      },
      stars: {
          type: Number,
          default: 0
      },
      hide: {
        type: Boolean,
        default: false,
      },
      deactivate: {
        type: Boolean,
        default: false,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
      uid: {
        type: String,
      }
});

export default mongoose.model('shop', ShopSchema);