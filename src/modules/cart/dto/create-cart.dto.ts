import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { CreateCartItemDto } from './create-cart-item.dto';

export class CreateCartDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  cartItems: CreateCartItemDto[];
}
