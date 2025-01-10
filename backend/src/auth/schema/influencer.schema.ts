import { Schema, Document } from 'mongoose';

export interface Influencer extends Document {
  username: string;
  password: string;
  email: string;
}

export const InfluencerSchema = new Schema<Influencer>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
