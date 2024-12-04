import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop()
  fullname: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  image: string;

  @Prop({ default: 'student' })
  role: string;

  @Prop({ default: 0 })
  subscribe: number;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({
    enum: ['none', 'approved', 'rejected'],
    default: 'none',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop()
  description: string;

  @Prop()
  facebook: string;

  @Prop()
  twitter: string;

  @Prop()
  linkedin: string;

  @Prop()
  youtube: string;

  @Prop()
  rejectionReason: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  subscribeChannels: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
  likedCourses: Types.ObjectId[];
  
  @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
  dislikedCourses: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
