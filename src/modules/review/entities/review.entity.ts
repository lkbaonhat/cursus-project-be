import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Course } from 'src/modules/course/entities/course.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // Điểm đánh giá từ 1 đến 5 sao

  @Prop({ type: String, required: false })
  comment?: string; // Nội dung đánh giá
}

export const ReviewSchema = SchemaFactory.createForClass(Review);