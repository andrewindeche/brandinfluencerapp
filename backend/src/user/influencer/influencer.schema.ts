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
  submissions: Submission[];
  campaign?: MongooseSchema.Types.ObjectId;
  role: 'influencer';
  profileImage?: string;
}

export const InfluencerSchema = new Schema<Influencer>({
  socialMediaHandles: {
    instagram: { type: String },
    youtube: { type: String },
    twitter: { type: String },
  },
  category: { type: String, required: true },
  bio: { type: String, required: true },
  submissions: [{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }],
  campaign: { type: MongooseSchema.Types.ObjectId, ref: 'Campaign' },
  profileImage: { type: String, default: '/images/image4.png' },
});

export const InfluencerModel = UserModel.discriminator<Influencer>(
  'Influencer',
  InfluencerSchema,
  'influencer'
);
