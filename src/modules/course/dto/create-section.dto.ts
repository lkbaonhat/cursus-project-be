import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSectionDto {
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: Types.ObjectId;
  @IsString()
  name: string;
}
