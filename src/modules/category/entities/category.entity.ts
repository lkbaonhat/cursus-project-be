import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Category {
    @Prop()
    name: string;

    @Prop()
    slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);