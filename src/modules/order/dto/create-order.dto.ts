import { IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class CreateOrderDto {
    @IsNotEmpty({ message: 'User ID is required' })
    userId: Types.ObjectId;

    @IsNotEmpty({ message: 'Quantity is required' })
    quantity: number;

    @IsNotEmpty({ message: 'Total amount is required' })
    totalAmount: number;

    @IsNotEmpty({ message: 'Payment type is required' })
    paymentType: string;

    @IsNotEmpty({ message: 'Payment status is required' })
    paymentStatus: string;
}
