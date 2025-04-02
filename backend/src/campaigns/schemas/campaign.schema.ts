import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Document } from 'mongoose';

@NestSchema()
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
  images: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  influencers: MongooseSchema.Types.ObjectId[];

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }] })
  submissions: string[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
