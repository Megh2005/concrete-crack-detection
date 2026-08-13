import mongoose, { Schema, Document } from 'mongoose';
import { getOrCreateModel } from '@/lib/db';

export interface IUser extends Document {
  salutation: 'Mr.' | 'Ms.' | 'Mrs.';
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    salutation: {
      type: String,
      enum: ['Mr.', 'Ms.', 'Mrs.'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const User = getOrCreateModel<IUser>('User', UserSchema);
