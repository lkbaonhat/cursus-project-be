import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateLectureDto {
  @IsNotEmpty({ message: 'Section ID is required' })
  sectionId: Types.ObjectId;
  @IsNotEmpty({ message: 'Title is required' })
  title: string;
  @IsOptional()
  description: string;
  @IsNotEmpty({ message: 'FreePreview is required' })
  freePreview: boolean;
  @IsNotEmpty({ message: 'VideoUrl is required' })
  videoUrl: string;
  @IsNotEmpty({ message: 'VideoPosterUrl is required' })
  videoPosterUrl: string;
  @IsNotEmpty({ message: 'Duration is required' })
  duration: string;
  @IsOptional()
  uploadedFiles: [];
}
