const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Medicine company name is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    imageURL: {
      type: String,
      required: [true, 'image is required'],
    },
    stockQuantity: {
      type: Number,
    },
    public: {
      type: Boolean,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  },
);

module.exports = mongoose.model('Medicine', medicineSchema);
