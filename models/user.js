const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
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
  }
});

export default mongoose.model("users", UserSchema);