import { Schema } from 'mongoose';
import { User, UserModel } from '../../user.schema';

export const BrandSchema = new Schema({
  bio: { type: String },
  profileImage: { type: String },
});

export interface Brand extends User {
  bio: string;
  profileImage?: string;
  role: 'brand';
  createdAt?: Date;
  updatedAt?: Date;
}

export const BrandModel = UserModel.discriminator<Brand>('Brand', BrandSchema);
