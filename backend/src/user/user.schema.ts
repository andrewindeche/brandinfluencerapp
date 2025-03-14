import { Schema, Document, model } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
  email: string;
  role: 'brand' | 'influencer' | 'admin' | 'superuser';
}

export const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['brand', 'admin', 'influencer', 'superuser'],
      default: 'user',
    },
  },
  { timestamps: true },
);

export const UserModel = model<User>('User', UserSchema);
