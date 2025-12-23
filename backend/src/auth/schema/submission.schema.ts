import { Prop, Schema as Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Submission extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Campaign' })
  campaign: MongooseSchema.Types.ObjectId | any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Influencer' })
  influencer: MongooseSchema.Types.ObjectId | any;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ required: false, default: 'pending' })
  status?: 'pending' | 'accepted' | 'rejected';
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
