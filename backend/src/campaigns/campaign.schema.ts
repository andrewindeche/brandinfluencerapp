import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Submission } from './submission.schema';

@Schema()
export class Campaign extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ type: [String], default: [] })
  images: string[]; // An array of image URLs

  @Prop({ type: [{ type: Schema.Types.ObjectId, ref: 'Submission' }] })
  submissions: Submission[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
