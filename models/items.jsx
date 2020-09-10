const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;

const ItemSchema = mongoose.Schema({
  imageID: {
    type: ObjectId,
  },
  name: {
    type: String,
    required: true
  },
  subTitle: {
      type: String,
  },
  description: {
      type: String,
  },
  shopId: {
    type: ObjectId,
    required: true
  },
  createdAt: {
    type: String,
    default: Date.now()
  },
  reviews: {
    type: Number,
  }
});

export default mongoose.model("items", ItemSchema);