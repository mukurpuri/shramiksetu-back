const mongoose = require("mongoose");

const UserProfileSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
  },
  dob: {
    type: Date,
    required: true
  },
  state: {
      type: String,
      required: true,
  },
  city: {
    type: String,
    required: true,
  },
  town: {
      type: String,
  },
  village: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

export default mongoose.model("users", UserProfileSchema);