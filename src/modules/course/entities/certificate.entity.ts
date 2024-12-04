import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Certificate {
  @Prop()
  fullName: string;
  @Prop()
  emailAdress: string;
  @Prop()
  phoneNumber: string;
  @Prop({ type: Types.ObjectId })
  subCategoryId: Types.ObjectId;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);