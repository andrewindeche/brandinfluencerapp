import { Schema, model, Document, Types } from 'mongoose';

const SubmissionSchema = new Schema({
  campaign: { type: Types.ObjectId, ref: 'Campaign', required: true },
  influencer: { type: Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});
console.log('Submission Schema:', SubmissionSchema.obj);

export interface Submission extends Document {
  campaign: Types.ObjectId;
  influencer: Types.ObjectId;
  content: string;
  submittedAt: Date;
}

export const SubmissionModel = model<Submission>(
  'Submission',
  SubmissionSchema,
);
