//update-review.dto.ts
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class UpdateReviewDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number; // Cập nhật điểm đánh giá

    @IsOptional()
    @IsString()
    comment?: string; // Cập nhật nội dung đánh giá
}
