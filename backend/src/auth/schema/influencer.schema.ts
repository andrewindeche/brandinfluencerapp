import { Schema, Document } from 'mongoose';
import { Submission } from '../schema/submission.schema';

export interface Influencer extends Document {
  username: string;
  password: string;
  email: string;
  submissions: Submission[]; 
}

export const InfluencerSchema = new Schema<Influencer>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  submissions: [{ type: Schema.Types.ObjectId, ref: 'Submission' }] 
});
