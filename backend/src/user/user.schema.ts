import { Schema, Document } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
  email: string;
  role: 'brand' | 'influencer';
}

export const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['brand', 'admin', 'influencer'],
    default: 'user',
  },
});
