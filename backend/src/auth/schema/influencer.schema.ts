import { Schema, Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Submission } from '../schema/submission.schema';

export interface Influencer extends Document {
  username: string;
  password: string;
  email: string;
  submissions: Submission[];
  campaign?: MongooseSchema.Types.ObjectId;
}

export const InfluencerSchema = new Schema<Influencer>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  submissions: [{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }],
  campaign: { type: MongooseSchema.Types.ObjectId, ref: 'Campaign' },
});
