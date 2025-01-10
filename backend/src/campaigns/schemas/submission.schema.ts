import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Campaign } from './campaign.schema';

@Schema()
export class Submission extends Document {
  @Prop({ type: Schema.Types.ObjectId, ref: 'Campaign' })
  campaign: Campaign;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  submittedAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
