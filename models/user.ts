import { Schema, model, SchemaTypes } from 'mongoose';

const userSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  viewedApartments: { type: SchemaTypes.Array },
});

const User = model('User', userSchema);

export { User };
