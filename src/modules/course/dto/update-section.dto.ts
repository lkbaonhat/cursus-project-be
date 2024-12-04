import { PartialType } from '@nestjs/mapped-types';
import { CreateSectionDto } from '../../course/dto/create-section.dto';
import { IsOptional } from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  name: string;
}
