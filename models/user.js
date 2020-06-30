const mongoose = require("mongoose");

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
  }
});

export default mongoose.model("users", UserSchema);