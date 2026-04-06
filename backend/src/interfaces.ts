import { Document, Types } from 'mongoose';
import { ObjectId } from 'mongoose';

export interface User extends Document {
  username: string;
  password: string;
  email: string;
  role: 'brand' | 'influencer' | 'admin' | 'superuser';
  refreshToken?: string;
  bio?: string;
  profileImage?: string;
}

export interface Influencer extends User {
  socialMediaHandles: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  category: string;
  bio: string;
  tips?: string;
  interests?: string[];
  submissions: Submission[];
  campaign?: Types.ObjectId;
  role: 'influencer';
  profileImage?: string;
}

export interface Brand extends User {
  bio?: string;
  interests?: string[];
  role: 'brand';
}

export interface Brand extends User {
  bio: string;
  profileImage?: string;
  role: 'brand';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Submission {
  _id: ObjectId;
  campaign: ObjectId;
  influencer: ObjectId;
  content: string;
  submittedAt: Date;
}

export interface SubmissionDocument extends Document {
  campaign: Types.ObjectId;
  influencer: Types.ObjectId;
  content: string;
  submittedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}
