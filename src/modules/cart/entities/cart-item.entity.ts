import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CartItem extends Document {

  @Prop()
  courseId: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  subCategory: string;

  @Prop()
  author: string;

  @Prop()
  price: number;

  @Prop()
  image: string;

  @Prop()
  slug: string;

  @Prop({ type: Boolean })
  isDeleted: boolean;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
