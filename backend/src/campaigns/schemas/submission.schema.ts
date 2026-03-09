import { Schema, model, Document, Types } from 'mongoose';
import { Campaign } from '../../campaigns/schemas/campaign.schema';
import { SubmissionDocument } from '../../interfaces';

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

export const SubmissionModel = model<SubmissionDocument>(
  'Submission',
  SubmissionSchema,
);
