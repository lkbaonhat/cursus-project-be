//review.controller

import { Controller, Post, Get, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { Review } from '../entities/review.entity';
import { ReviewService } from '../services/review.service';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Public } from 'src/decorator/custom';


@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post('/create')
    createReview(@Body() reviewData: Partial<Review>) {
        return this.reviewService.createReview(reviewData);
    }

    @Get()
    async findAll(): Promise<Review[]> {
        return this.reviewService.getReviews();
    }

    @Get('/get-by-course/:courseId')
    @Public()
    async findReviewsByCourseId(@Param('courseId') courseId: string): Promise<Review[]> {
        return this.reviewService.getReviewsByCourseId(courseId);
    }

    @Post('/update/:reviewId')
    updateReview(@Param('reviewId') reviewId: string, @Body() updateData: UpdateReviewDto) {
        return this.reviewService.updateReview(reviewId, updateData);
    }

    @Post('/delete/:reviewId')
    deleteReview(@Param('reviewId') reviewId: string) {
        return this.reviewService.deleteReview(reviewId);
    }
    @Get('/count')
    async getTotalReviews(): Promise<number> {
        return this.reviewService.countReviews();
    }
    @Get('/summary/:courseId')
    @Public()
    async getReviewsSummary(@Param('courseId') courseId: string) {
        return this.reviewService.getReviewsSummary(courseId);
    }
    @Get('/filtered/:courseId')
    @Public()
    async getFilteredReviews(
        @Param('courseId') courseId: string,
        @Query('rating') rating?: number,
    ) {
        return this.reviewService.getFilteredReviews(courseId, Number(rating));
    }
    @Get('/recent')
    @Public()
    async getRecentReviews(@Query('limit') limit?: number): Promise<Review[]> {
        return this.reviewService.getRecentReviews(limit);
    }
    @Get('/average-rating/:courseId')
    @Public()
    async getAverageRating(@Param('courseId') courseId: string): Promise<{ averageRating: string  }> {
        try {
            const averageRating = await this.reviewService.getAverageRatingByCourseId(courseId);
            return { averageRating: averageRating.averageRating };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    @Get('/average-rating/slug/:slug')
    @Public()
    async getAverageRatingBySlug(@Param('slug') slug: string) {
        try {
            return await this.reviewService.getAverageRatingBySlug(slug);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    @Get('/check-review')
    async checkUserReview(
        @Query('courseId') courseId: string,
        @Query('userId') userId: string,
    ): Promise<{ hasReviewed: boolean }> {
        const hasReviewed = await this.reviewService.checkUserReview(courseId, userId);
        return { hasReviewed };
    }
    

}