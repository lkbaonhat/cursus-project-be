import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSubCategoryDto } from './update-sub-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { 
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateSubCategoryDto)
    subcategories?: UpdateSubCategoryDto[];
}
