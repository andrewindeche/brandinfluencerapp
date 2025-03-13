import { Schema } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Submission } from '../../auth/schema/submission.schema';
import { User, UserModel } from '../user.schema';

export interface Influencer extends User {
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
});

export const InfluencerModel = UserModel.discriminator<Influencer>(
  'Influencer',
  InfluencerSchema,
);
