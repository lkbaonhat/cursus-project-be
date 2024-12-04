import { IsString, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCartItemDto {
  @IsNotEmpty()
  courseId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  subCategory: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsBoolean()
  isDeleted: boolean;
}


