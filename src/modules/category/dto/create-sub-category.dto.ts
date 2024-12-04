import { IsNotEmpty } from "class-validator";

export class CreateSubCategoryDto {
    @IsNotEmpty({ message: 'Name is required' })
    name: string;
}
