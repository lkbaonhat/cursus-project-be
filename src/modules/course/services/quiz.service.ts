import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz } from '../entities/quiz.entity';
import { Model, Types } from 'mongoose';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { SlugService } from 'src/utils/slug.service';
import { SaveQuizResultDto } from '../dto/save-quiz-result.dto';
import { QuizResult } from '../entities/quizResult.entity';
import { UserService } from 'src/modules/user/user.service';
import { CourseService } from './course.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizResult.name) private quizResultModel: Model<QuizResult>,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    private slugService: SlugService,
    private readonly userService: UserService,
  ) {}

  async isQuizExist(quizId: string) {
    try {
      const quiz = await this.quizModel.findById(quizId);
      return quiz ? true : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async isQuizResultExist(quizResultId: string, userId: string) {
    try {
      const quizResult = await this.quizResultModel.findOne({
        quizId: new Types.ObjectId(quizResultId),
        userId: new Types.ObjectId(userId),
      });
      return quizResult;
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(createQuizDto: CreateQuizDto) {
    const { ...payload } = createQuizDto;

    const quiz = await this.quizModel.create({
      ...payload,
      sectionId: new Types.ObjectId(payload.sectionId),
      slug: this.slugService.createSlug(payload.title),
    });

    if (!quiz) {
      throw new BadRequestException('Quiz cannot be created');
    }

    return {
      quizId: quiz._id,
    };
  }

  async saveResult(saveResultQuizDto: SaveQuizResultDto) {
    const { ...payload } = saveResultQuizDto;
    try {
      if (!Types.ObjectId.isValid(payload.quizId)) {
        throw new BadRequestException('Invalid quiz ID format');
      } else if (!Types.ObjectId.isValid(payload.userId)) {
        throw new BadRequestException('Invalid user ID format');
      } else if (!Types.ObjectId.isValid(payload.courseId)) {
        throw new BadRequestException('Invalid course ID format');
      }
      const quizExists = await this.isQuizExist(payload.quizId);
      const userExists = await this.userService.isUserExist(payload.userId);
      const courseExists = await this.courseService.isCourseExist(
        payload.courseId,
      );
      const quizResultExists = await this.isQuizResultExist(
        payload.quizId,
        payload.userId,
      );
      if (quizResultExists) {
        quizResultExists.score = payload.score;
        quizResultExists.result = payload.result;
        await quizResultExists.save();
        return;
      }
      if (quizExists && userExists && courseExists) {
        const quizResult = await this.quizResultModel.create({
          ...payload,
          quizId: new Types.ObjectId(payload.quizId),
          userId: new Types.ObjectId(payload.userId),
          courseId: new Types.ObjectId(payload.courseId),
        });
        if (!quizResult) {
          throw new BadRequestException('Cannot save quiz result');
        }
      } else if (!quizExists) {
        throw new BadRequestException('Quiz not found');
      } else if (!userExists) {
        throw new BadRequestException('User not found');
      } else if (!courseExists) {
        throw new BadRequestException('Course not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async findQuizResultsByUserIdAndQuizId(userId: string, quizId: string) {
    try {
      if (!Types.ObjectId.isValid(quizId)) {
        throw new BadRequestException('Invalid quiz ID format');
      } else if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const quizResults = await this.quizResultModel
        .findOne({
          userId: new Types.ObjectId(userId),
          quizId: new Types.ObjectId(quizId),
        })
        .sort({ updatedAt: -1 });

      if (!quizResults) {
        throw new NotFoundException('Quiz result not found');
      }

      return quizResults;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while retrieving quiz results',
      );
    }
  }

  async findQuizResultsByUserIdAndCourseId(userId: string, courseId: string) {
    try {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid course ID format');
      } else if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const quizResults = await this.quizResultModel.find({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
      });

      if (quizResults.length === 0) {
        throw new NotFoundException('Quiz result not found');
      }

      return quizResults;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while retrieving quiz results',
      );
    }
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const { ...payload } = updateQuizDto;
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid quiz ID format');
      }
      const quizExists = await this.isQuizExist(id);
      if (quizExists) {
        const quiz = await this.quizModel.findByIdAndUpdate(id, {
          ...payload,
          slug: this.slugService.createSlug(payload.title),
        });
        if (!quiz) {
          throw new BadRequestException('Cannot update quiz');
        }
      } else {
        throw new BadRequestException('Quiz not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async findAllQuizBySectionId(sectionId: string) {
    const quiz = await this.quizModel.find({
      sectionId: new Types.ObjectId(sectionId),
    });

    if (!quiz) {
      throw new BadRequestException('Quiz is empty');
    }

    return quiz;
  }

  async getAllInfoQuizByQuizId(quizId: string) {
    let listQuestion: any = [];
    try {
      if (!Types.ObjectId.isValid(quizId)) {
        throw new BadRequestException('Invalid quiz ID format');
      }
      const quizExists = await this.isQuizExist(quizId);
      if (quizExists) {
        listQuestion = await this.quizModel.findById(quizId);
        if (!listQuestion) {
          throw new BadRequestException('Cannot get list question');
        }
      } else {
        throw new BadRequestException('Quiz not found');
      }
      return listQuestion;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }
}
