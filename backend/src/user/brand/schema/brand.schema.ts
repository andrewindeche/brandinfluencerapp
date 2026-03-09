import { Schema } from 'mongoose';
import { User, UserModel } from '../../user.schema';
import { Brand } from '../../../interfaces';

export const BrandSchema = new Schema({

export const BrandModel = UserModel.discriminator<Brand>('Brand', BrandSchema);
