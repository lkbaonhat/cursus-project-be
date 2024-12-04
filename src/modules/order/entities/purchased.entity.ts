import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Purchased {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], required: true })
  courseIds: Types.ObjectId[];
}

export const PurchasedSchema = SchemaFactory.createForClass(Purchased);
