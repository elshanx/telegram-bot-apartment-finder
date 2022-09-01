import { Schema, model } from 'mongoose';

const apartmentSchema = new Schema(
  {
    apartmentId: { type: Number },
    date: { type: String },
    link: { type: String },
    price: { type: Number },
    location: { type: String },
  },
  { timestamps: true },
);

const Apartment = model('Apartment', apartmentSchema);

export { Apartment };
