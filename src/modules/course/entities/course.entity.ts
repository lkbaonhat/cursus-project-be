import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Course {
  @Prop()
  title: string;
  @Prop()
  description: string;
  @Prop()
  shortDescription: string;
  @Prop()
  requirements: string;
  @Prop()
  studentLearn: string;
  @Prop()
  levels: string[];
  @Prop()
  captions: string[];
  @Prop()
  image: string;
  @Prop()
  introVideo: string;
  @Prop({ default: 0 })
  price: number;
  @Prop()
  language: string[];
  @Prop({ type: Types.ObjectId, ref: 'SubCategory' })
  subCategoryId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
  @Prop()
  slug: string;
  @Prop({ default: 0 })
  totalSold: number;
  @Prop({ default: 0 })
  totalView: number;
  @Prop({ default: 0 })
  totalRating: number;
  @Prop({ default: 0 })
  totalErrolled: number;
  @Prop({ default: false })
  requireLogIn: boolean;
  @Prop({ default: false })
  requireEnroll: boolean;
  @Prop({ default: 0 })
  discount: number;
  @Prop({ default: false })
  isDeleted: boolean;
  @Prop({
    enum: ['pending', 'approved', 'rejected', 'draft'],
    default: 'draft',
  })
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  @Prop()
  rejectionReason?: string;
  @Prop()
  approvedAt?: string;
  @Prop({ default: false })
  isBestseller: boolean;
  @Prop({ default: 0 })
  likes: number;
  @Prop({ default: 0 })
  dislikes: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
