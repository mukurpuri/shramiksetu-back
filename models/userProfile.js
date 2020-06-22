const mongoose = require("mongoose");

const UserProfileSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  marritalStatus: {
    type: String,
    required: true
  },
  education: {
      type: String,
      required: true,
  },
  experience: {
    type: String,
    required: true
  },
  expertise: {
    type: String,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  imageID: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

export default mongoose.model("UserProfile", UserProfileSchema);