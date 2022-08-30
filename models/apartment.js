const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    apartmentId: { type: Number },
    date: { type: String },
    link: { type: String },
    price: { type: Number },
    location: { type: String },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment;
