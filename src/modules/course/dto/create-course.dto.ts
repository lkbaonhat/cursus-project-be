import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;
  @IsOptional()
  description: string;
  @IsOptional()
  shortDescription: string;
  @IsOptional()
  studentLearn: string;
  @IsOptional()
  captions: string[];
  @IsOptional()
  image: string;
  @IsOptional()
  introVideo: string;
  @IsNotEmpty({ message: 'Requirements is required' })
  requirements: string;
  @IsNotEmpty({ message: 'Level is required' })
  levels: string[];
  @IsNotEmpty({ message: 'Language is required' })
  language: string[];
  @IsNotEmpty({ message: 'SubcategoryID is required' })
  subCategoryId: Types.ObjectId;
  @IsNotEmpty({ message: 'UserId is required' })
  userId: Types.ObjectId;
  @IsOptional()
  price: number;
}
