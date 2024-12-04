import { PartialType } from '@nestjs/mapped-types';
import { CreateLectureDto } from '../../course/dto/create-lecture.dto';
import { IsOptional } from 'class-validator';

export class UpdateLectureDto extends PartialType(CreateLectureDto) {
  @IsOptional()
  isDeleted: boolean;
}
