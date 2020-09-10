const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;

const UserSchema = mongoose.Schema({
  name: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true
  },
  OTP: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  registered: {
    type: Boolean,
    default: false
  },
  imageID: {
    type: String,
  },
  type: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  lat: {
    type: String
  },
  lng: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  allowSave: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  uid: {
    type: String,
  }
});

export default mongoose.model("users", UserSchema);