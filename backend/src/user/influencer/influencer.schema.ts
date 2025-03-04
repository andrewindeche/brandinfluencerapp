import { Schema, Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Submission } from '../../auth/schema/submission.schema';

export interface Influencer extends Document {
  name: string;
  username: string;
  password: string;
  email: string;
  socialMediaHandles: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  category: string;
  bio: string;
  location: string;
  submissions: Submission[];
  campaign?: MongooseSchema.Types.ObjectId;
  role: 'influencer';
}

export const InfluencerSchema = new Schema<Influencer>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  socialMediaHandles: {
    instagram: { type: String },
    youtube: { type: String },
    twitter: { type: String },
  },
  category: { type: String, required: true },
  bio: { type: String, required: true },
  location: { type: String, required: true },
  submissions: [{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }],
  campaign: { type: MongooseSchema.Types.ObjectId, ref: 'Campaign' },
  role: { type: String, required: true, default: 'influencer' },
});
