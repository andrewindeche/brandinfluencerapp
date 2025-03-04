import { Schema, Document } from 'mongoose';

export const BrandSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  website: { type: String },
  logoUrl: { type: String },
  contactInfo: {
    phone: { type: String },
    address: { type: String },
  },
  role: { type: String, required: true, default: 'brand' },
}, { timestamps: true });

export interface Brand extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  contactInfo?: {
    phone?: string;
    address?: string;
  };
  role: 'brand';
  createdAt?: Date;
  updatedAt?: Date;
}

