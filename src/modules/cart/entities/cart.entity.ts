import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CartItem, CartItemSchema } from './cart-item.entity';

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true, unique: true })
  userId: Types.ObjectId;
  
  @Prop({ type: [CartItemSchema], default: [] })
  cartItems: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
