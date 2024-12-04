import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsOptional()
  isDeleted: boolean;
  @IsOptional()
  requireLogIn: boolean;
  @IsOptional()
  requireEnroll: boolean;
  @IsOptional()
  discount: number;
  @IsOptional()
  @IsString()
  status?: 'pending' | 'approved' | 'rejected';
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
