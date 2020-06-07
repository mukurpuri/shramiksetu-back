const mongoose = require("mongoose");

const UserProfileSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  year: {
    type: String,
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
  sex: {
    type: String,
    required: true
  },
  maritialStatus: {
    type: Boolean,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  expertise: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

export default mongoose.model("UserProfile", UserProfileSchema);