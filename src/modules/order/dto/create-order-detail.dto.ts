import { IsNotEmpty, IsNumber } from "class-validator";
import { Types } from "mongoose";

export class CreateOrderDetailDto {
    @IsNotEmpty({ message: 'Order ID is required' })
    orderId: Types.ObjectId;

    @IsNotEmpty({ message: 'Course ID is required' })
    courseId: Types.ObjectId;

    @IsNumber({}, { message: 'Quantity must be a number' })
    quantity: number;

    @IsNumber({}, { message: 'Price must be a number' })
    price: number;
}

export class GetOrderDetailDto {
    @IsNotEmpty({ message: 'User ID is required' })
    userId: string;

    @IsNotEmpty({ message: 'Course ID is required' })
    courseId: string;
}
