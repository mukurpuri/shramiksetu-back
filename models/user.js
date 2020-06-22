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
  type: {
    type: String,
  }
});

export default mongoose.model("users", UserSchema);