const mongoose = require("mongoose");

const ConnectionSchema = mongoose.Schema({
  primary: {
    type: String,
    required: true
  },
  secondary: {
    type: String,
    required: true
  },
  acceptedOn: {
    type: Date,
  },
  accepted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

export default mongoose.model("connections", ConnectionSchema);