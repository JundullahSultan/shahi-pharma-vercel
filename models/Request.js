const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineName: { // "Name"
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  shapeAndDose: { // "Shape and dose" (e.g., Tablet 500mg)
    type: String,
    required: true
  },
  tradeName: { // "Trade name"
    type: String,
    required: false // Optional, as it might be same as Name
  },
  scientificName: { // "Scientific name"
    type: String,
    required: false
  },
  description: { // "Discription"
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);