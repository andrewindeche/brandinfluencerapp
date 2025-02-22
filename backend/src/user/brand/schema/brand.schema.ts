import { Schema, Document } from 'mongoose';

export const BrandSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export interface Brand extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
}
