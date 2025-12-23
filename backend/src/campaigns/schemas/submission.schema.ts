import { Schema, model, Document, Types } from 'mongoose';
import { Campaign } from '../../campaigns/schemas/campaign.schema';

const SubmissionSchema = new Schema(
  {
    campaign: { type: Types.ObjectId, ref: 'Campaign', required: true },
    influencer: { type: Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export interface Submission extends Document {
  campaign: Types.ObjectId | Campaign;
  influencer: Types.ObjectId;
  content: string;
  submittedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export const SubmissionModel = model<Submission>(
  'Submission',
  SubmissionSchema,
);
