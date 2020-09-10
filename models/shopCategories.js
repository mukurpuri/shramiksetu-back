import mongoose from 'mongoose';
import moment from 'moment';
var ObjectId = require('mongodb').ObjectID;

var ShopCategories = new mongoose.Schema({  
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

export default mongoose.model('shopCategories', ShopCategories);