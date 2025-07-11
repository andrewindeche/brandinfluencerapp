import { Prop, Schema as Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

@Schema()
export class Campaign {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  instructions: string;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  influencers: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  brand: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }] })
  submissions: Types.ObjectId[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
