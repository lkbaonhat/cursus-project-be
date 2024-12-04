import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Section {
  @Prop()
  name: string;
  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId: string;
  @Prop()
  slug: string;
  @Prop({ default: false })
  isDeleted: boolean;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
