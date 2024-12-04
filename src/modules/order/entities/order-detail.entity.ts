import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class OrderDetail {
    @Prop({ type: Types.ObjectId, ref: 'Order' })
    orderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course' })
    courseId: Types.ObjectId;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    quantity: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
