import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop()
    quantity: number;

    @Prop()
    totalAmount: number;

    @Prop()
    paymentType: string;

    @Prop()
    paymentStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);