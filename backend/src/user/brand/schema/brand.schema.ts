import { Schema } from 'mongoose';
import { User, UserModel } from '../../user.schema';
import { Brand } from '../../../interfaces';

export const BrandSchema = new Schema({
  interests: [{ type: String }],
});

export const BrandModel = UserModel.discriminator<Brand>('Brand', BrandSchema);

export type { Brand };
