// create-review.dto.ts
import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @IsNotEmpty()
    @IsString()
    userId: string; // ID của người dùng

    @IsNotEmpty()
    @IsString()
    courseId: string; // ID của khóa học

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number; // Điểm đánh giá từ 1 đến 5
    @IsOptional()
    @IsString()
    comment?: string; // Nội dung đánh giá
}
