import { Schema, model } from 'mongoose';
import { User } from '../interfaces';

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
    bio: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    brandId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, discriminatorKey: '__t' },
);

export const UserModel = model<User>('User', UserSchema);

export type { User };
