import { IsNotEmpty } from 'class-validator';

export class SaveQuizResultDto {
  @IsNotEmpty({ message: 'Quiz ID is required' })
  quizId: string;
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;
  @IsNotEmpty({ message: 'Score is required' })
  score: number;
  @IsNotEmpty({ message: 'Result is required' })
  result: string;
}
