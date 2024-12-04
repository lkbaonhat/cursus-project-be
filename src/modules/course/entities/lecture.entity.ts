import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Lecture {
  @Prop({ type: Types.ObjectId, ref: 'Section' })
  sectionId: Types.ObjectId;
  @Prop()
  title: string;
  @Prop()
  description: string;
  @Prop()
  freePreview: boolean;
  @Prop()
  videoUrl: string;
  @Prop()
  videoPosterUrl: string;
  @Prop()
  duration: string;
  @Prop()
  uploadedFiles: [];
  @Prop()
  slug: string;
  @Prop({ default: false })
  isDeleted: boolean;
  @Prop({ default: 'not learned' })
  status: string;
  @Prop({ default: 'lecture' })
  type: string;
}

export const LectureSchema = SchemaFactory.createForClass(Lecture);

// extend common Entity
