import { Prop, Schema as NestSchema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@NestSchema()
export class Submission extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Campaign' })
  campaign: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Influencer' })
  influencer: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  submittedAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
