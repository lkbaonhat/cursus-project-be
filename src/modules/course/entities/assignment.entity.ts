import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
class UploadedFiles {
  @Prop()
  id: number;
  @Prop()
  name: string;
  @Prop()
  url: string;
}

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'Section' })
  sectionId: Types.ObjectId;
  @Prop()
  title: string;
  @Prop()
  description: string;
  @Prop()
  timeDuration: number;
  @Prop()
  totalNumber: number;
  @Prop()
  minPassNumber: number;
  @Prop()
  uploadLimit: number;
  @Prop()
  maxAttachmentSize: number;
  @Prop()
  slug: string;
  @Prop()
  uploadedFiles: UploadedFiles[];
  @Prop({ default: false })
  isDeleted: boolean;
  @Prop({ default: 'assignment' })
  type: string;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
