import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
class ImageQuestion {
  id: string;
  name: string;
  url: string;
}
@Schema({ _id: false })
class Option {
  @Prop()
  id: string;
  @Prop({ required: true })
  title: string;
  @Prop({ default: false })
  isCorrect: boolean;
}

@Schema({ _id: false })
class Question {
  @Prop()
  question: string;
  @Prop({ type: [Option] })
  options: Option[];
  @Prop()
  correctAnswer: string;
  @Prop()
  type: string;
  @Prop()
  score: number;
  @Prop()
  imageQuestion: ImageQuestion[];
}

@Schema({ timestamps: true })
export class Quiz {
  @Prop()
  title: string;
  @Prop()
  description: string;
  @Prop({ type: Types.ObjectId, ref: 'Section' })
  sectionId: string;
  @Prop()
  timeLimit: number;
  @Prop()
  quizGradable: boolean;
  @Prop()
  passingScore: number;
  @Prop()
  numberOfQuestions: number;
  @Prop()
  showTime: boolean;
  @Prop()
  questionLimit: number;
  @Prop()
  slug: string;
  @Prop()
  isDeleted: boolean;
  @Prop({
    type: [Question],
    required: true,
    validate: [
      (val: any) => val.length > 0,
      'Quiz must have at least one question',
    ],
  })
  questions: Question[];
  @Prop({ default: 'quiz' })
  type: string;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
