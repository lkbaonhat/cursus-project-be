import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from '../entities/review.entity';
import { Course } from 'src/modules/course/entities/course.entity';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    ) { }

    async createReview(reviewData: Partial<Review>): Promise<Review> {
        const existingReview = await this.reviewModel.findOne({
            userId: reviewData.userId,
            courseId: reviewData.courseId,
        });
        if (existingReview) {
            throw new BadRequestException('You have already reviewed this course.');
        }
        const review = new this.reviewModel(reviewData);
        return review.save();
    }

    async getReviews(): Promise<Review[]> {
        return this.reviewModel
            .find()
            .sort({ createdAt: -1 })
            .populate({ path: 'userId', select: '_id fullname image' })
            .populate({ path: 'courseId', select: '_id' })
            .exec();
    }
    async getReviewsByCourseId(courseId: string): Promise<Review[]> {
        return this.reviewModel
            .find({ courseId })
            .sort({ createdAt: -1 })
            .populate({ path: 'userId', select: '_id fullname image' })
            .populate({ path: 'courseId', select: '_id ' })
            .exec();
    }

    async updateReview(reviewId: string, updateData: Partial<Review>): Promise<Review> {
        return this.reviewModel.findByIdAndUpdate(reviewId, updateData, { new: true });
    }

    async deleteReview(reviewId: string): Promise<void> {
        await this.reviewModel.findByIdAndDelete(reviewId);
    }
    async countReviews(): Promise<number> {
        return this.reviewModel.countDocuments().exec();
    }
    async getReviewsSummary(courseId: string) {
        const reviews = await this.reviewModel.find({ courseId }).exec();

        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                : 0;

        const ratingCounts = [0, 0, 0, 0, 0];
        reviews.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
                ratingCounts[review.rating - 1]++;
            }
        });

        const ratingPercentages = ratingCounts.map((count) =>
            totalReviews > 0 ? (count / totalReviews) * 100 : 0,
        );

        return {
            totalReviews,
            averageRating: parseFloat(averageRating.toFixed(1)),
            ratingCounts,
            ratingPercentages: ratingPercentages.reverse(),
        };
    }
    async getFilteredReviews(courseId: string, rating?: number) {
        const query = { courseId };
        if (rating) {
            query['rating'] = rating;
        }

        return this.reviewModel
            .find(query)
            .sort({ createdAt: -1 })
            .populate({ path: 'userId', select: '_id fullname image' })
            .exec();
    }
    async getRecentReviews(limit?: number): Promise<Review[]> {
        return this.reviewModel
            .find()
            .limit(limit)
            .populate({ path: 'userId', select: '_id fullname image' })
            .populate({ path: 'courseId', select: '_id' })
            .exec();
    }
    async getAverageRatingByCourseId(courseId: string):  Promise<{ averageRating: string }> {
        try {
            if (!Types.ObjectId.isValid(courseId)) {
                throw new Error('Invalid course ID format');
            }
            const reviews = await this.reviewModel.find({ courseId }).select('rating').exec();
            if (!reviews || reviews.length === 0) {
                return { averageRating: '0' };
            }
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            return { averageRating: averageRating.toFixed(1) };
        } catch (error) {
            console.error('Error calculating average rating:', error.message);
            throw new Error('Could not calculate average rating');
        }
    }
    async getAverageRatingBySlug(slug: string): Promise<{ averageRating: string, numberOfRatings: number }> {
        try {
            const course = await this.courseModel.findOne({ slug }).select('_id').exec();
            if (!course) {
                throw new Error(`Course with slug "${slug}" not found`);
            }
            const reviews = await this.reviewModel.find({ courseId: course._id.toString() }).select('rating').exec();

            if (!reviews || reviews.length === 0) {
                return { averageRating: '0', numberOfRatings: 0 };
            }
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

            const averageRating = totalRating / reviews.length;
            return {
                averageRating: averageRating.toFixed(1) ,
                numberOfRatings: reviews.length,
            }
        } catch (error) {
            console.error('Error fetching average rating by slug:', error.message);
            throw new Error('Could not calculate average rating by slug');
        }
    }
    async checkUserReview(courseId: string, userId: string): Promise<boolean> {
        const existingReview = await this.reviewModel.findOne({ courseId, userId });
        return !!existingReview;
    }

}