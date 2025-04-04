import { ObjectId } from 'mongoose';

export interface Submission {
  _id: ObjectId;
  campaign: ObjectId;
  influencer: ObjectId;
  content: string;
  submittedAt: Date;
}
