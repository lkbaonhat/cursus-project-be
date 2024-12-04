import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

class ImageQuestion {
  id: string;
  name: string;
  url: string;
}
class OptionsDto {
  @IsOptional()
  id: string;
  @IsNotEmpty({ message: 'Option title is required' })
  title: string;
  @IsNotEmpty({ message: 'Option isCorrect is required' })
  isCorrect: boolean;
}
class QuestionDto {
  @IsNotEmpty({ message: 'Title text is required' })
  title: string;
  @IsOptional()
  imageQuestion: ImageQuestion[];
  @IsNotEmpty({ message: 'Score are required' })
  score: number;
  @IsOptional()
  options: OptionsDto[];
  @IsOptional()
  correctAnswer: number;
  @IsNotEmpty({ message: 'Question type is required' })
  type: string;
}
export class CreateQuizDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;
  @IsOptional()
  description: string;
  @IsNotEmpty({ message: 'Section ID is required' })
  sectionId: Types.ObjectId;
  @IsNotEmpty({ message: 'Time limit is required' })
  timeLimit: number;
  @IsNotEmpty({ message: 'Passing score is required' })
  passingScore: number;
  @IsNotEmpty({ message: 'Quiz Gradable is required' })
  quizGradable: boolean;
  @IsNotEmpty({ message: 'Question limit is required' })
  questionLimit: number;
  @IsNotEmpty({ message: 'Show time is required' })
  showTime: boolean;
  @IsNotEmpty({ message: 'Number of questions is required' })
  questions: QuestionDto[];
}
