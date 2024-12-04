import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class SubCategory {
    @Prop()
    name: string;

    @Prop()
    slug: string;

    @Prop({ type: Types.ObjectId, ref: 'Category' })
    categoryId: Types.ObjectId;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
