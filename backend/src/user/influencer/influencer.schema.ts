import { Schema } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Submission, Influencer } from '../../interfaces';
import { User, UserModel } from '../user.schema';

export const InfluencerSchema = new Schema<Influencer>({
  socialMediaHandles: {
    instagram: { type: String },
    youtube: { type: String },
    twitter: { type: String },
  },
  category: { type: String, required: true },
  bio: { type: String, required: true },
  tips: { type: String, default: '' },
  interests: [{ type: String }],
  submissions: [{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }],
  campaign: { type: MongooseSchema.Types.ObjectId, ref: 'Campaign' },
  profileImage: { type: String, default: '/images/image4.png' },
});

export const InfluencerModel = UserModel.discriminator<Influencer>(
  'Influencer',
  InfluencerSchema,
  'influencer',
);

export type { Influencer };
