import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuizResult {
  @Prop({ type: Types.ObjectId, ref: 'Quiz' })
  quizId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;
  @Prop()
  score: number;
  @Prop()
  result: string;
}

export const QuizResultSchema = SchemaFactory.createForClass(QuizResult);
