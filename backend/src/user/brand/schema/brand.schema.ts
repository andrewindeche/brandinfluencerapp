import { Schema } from 'mongoose';
import { User, UserModel } from '../../user.schema';

export const BrandSchema = new Schema({
  description: { type: String },
  website: { type: String },
  bio: { type: String },
  profileImage: { type: String },
  logoUrl: { type: String },
  contactInfo: {
    phone: { type: String },
    address: { type: String },
  },
});

export interface Brand extends User {
  description?: string;
  website?: string;
  logoUrl?: string;
  bio: string;
  profileImage?: string;
  contactInfo?: {
    phone?: string;
    address?: string;
  };
  role: 'brand';
  createdAt?: Date;
  updatedAt?: Date;
}

export const BrandModel = UserModel.discriminator<Brand>('Brand', BrandSchema);
