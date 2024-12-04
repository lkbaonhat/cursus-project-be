import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePurchasedDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsMongoId({ message: 'User ID is invalid format' })
  userId: Types.ObjectId;

  @IsNotEmpty({ message: 'Course ID is required' })
  @IsMongoId({ message: 'Course ID is invalid format' })
  courseIds: Types.ObjectId[];
}
