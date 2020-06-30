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
  },
  marritalStatus: {
    type: String,
  },
  education: {
      type: String,
  },
  experience: {
    type: String,
  },
  expertise: {
    type: String,
  },
  location: {
    type: String,
    required: true
  },
  problemSolver: {
    type: String,
  },
  enviromentHelper: {
    type: String,
  },
  Liked: {
    type: String,
  },
  locationLat: {
    type: String,
  },
  locationLng: {
    type: String,
  },
  imageID: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  about: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

export default mongoose.model("UserProfile", UserProfileSchema);