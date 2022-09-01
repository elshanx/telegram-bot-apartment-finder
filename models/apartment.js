const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    apartmentId: { type: Number },
    date: { type: String },
    link: { type: String },
    price: { type: String },
    location: { type: String },
  },
  { timestamps: true },
);

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment;
