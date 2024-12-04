import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress } from '../entities/progress.entity';
import { CreateProgressDto } from '../dto/create-progresss.dto';
import { CertificateDto, UpdateProgressDto } from '../dto/update-progress.dto';
import { ResponseMessage } from 'src/decorator/custom';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/modules/user/user.service';
import { CourseService } from './course.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<Progress>,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
    private readonly courseService: CourseService,
  ) { }

  async createProgress(createProgressDto: CreateProgressDto) {
    const { ...playload } = createProgressDto;
    try {
      const progress = await this.progressModel.create({ ...playload });
      if (!progress) {
        throw new BadRequestException('Progress cannot be created');
      }
      return progress;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(error.message);
    }
  }

  async findOneProgressByUserId(userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException(`Id: ${userId} Invalid format`);
      }

      const existUser = await this.progressModel.findOne({
        userId: new Types.ObjectId(userId),
      });
      return existUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(error.message);
    }
  }

  async findOneCourseProgressByCourseId(courseId: string, userId: string) {
    try {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException(`CourseId: ${courseId} Invalid format`);
      } else if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException(`UserId: ${userId} Invalid format`);
      }

      const courseProgress = await this.findOneProgressByUserId(userId);
      if (!courseProgress) {
        throw new BadRequestException(`Progress for user ${userId} not found.`);
      }

      const course = courseProgress.course.find(
        (course: any) => course.courseId.toString() === courseId,
      );

      if (!course) {
        throw new NotFoundException(`Course ${courseId} not found.`);
      }

      return course;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(error.message);
    }
  }

  calculateSectionCompletionPercentage = (section) => {
    const totalItems = [
      ...(section.lectures || []),
      ...(section.quizzes || []),
      ...(section.assignments || []),
    ];
    if (!totalItems.length) return 100; // Empty sections are considered fully complete

    const completedCount = totalItems.filter(
      (item) => item.status === 'learn',
    ).length;
    return Math.round((completedCount / totalItems.length) * 100);
  };

  calculateCourseCompletionPercentage = (sections) => {
    if (!sections?.length) return 100; // Empty courses are considered fully complete

    const totalSectionPercentage = sections.reduce((sum, section) => {
      return sum + section.progress;
    }, 0);

    // Average percentage across all sections
    return Math.round(totalSectionPercentage / sections.length);
  };

  async updateProgress(updateProgressDto: UpdateProgressDto) {
    try {
      const { userId, courseId, lectureId, quizId, assignmentId } =
        updateProgressDto;

      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException(`Invalid userId: ${userId}`);
      }

      const existingProgress = await this.progressModel.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (!existingProgress) {
        throw new BadRequestException(`Progress for user ${userId} not found.`);
      }

      let updated = false;

      existingProgress.course?.forEach((course) => {
        if (courseId && course.courseId.toString() === courseId) {
          course.sections?.forEach((section) => {
            section.lectures?.forEach((lecture) => {
              if (lectureId && lecture.lectureId.toString() === lectureId) {
                lecture.status = 'learn';
                updated = true;
              }
            });

            section.quizzes?.forEach((quiz) => {
              if (quizId && quiz.quizId.toString() === quizId) {
                quiz.status = 'learn';
                updated = true;
              }
            });

            section.assignments?.forEach((assignment) => {
              if (
                assignmentId &&
                assignment.assignmentId.toString() === assignmentId
              ) {
                assignment.status = 'learn';
                updated = true;
              }
            });

            // Update section progress
            section.progress =
              this.calculateSectionCompletionPercentage(section);

            // Mark section as complete if progress reaches 100%
            section.status = section.progress === 100 ? 'learn' : 'not-learn';
          });

          // Update course progress
          course.progress = this.calculateCourseCompletionPercentage(
            course.sections,
          );

          // Mark course as complete if progress reaches 100%
          course.status = course.progress === 100 ? 'learn' : 'not-learn';
        }
      });

      if (!updated) {
        throw new BadRequestException(`No matching entity found to update.`);
      }

      const updatedProgress = await this.progressModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { course: existingProgress.course },
        { new: true },
      );

      if (!updatedProgress) {
        throw new BadRequestException('Failed to update progress');
      }

      if (updatedProgress.course.find((course) => course.progress === 100)) {
        this.getCertificate({ userId, courseId });
      }

      return ResponseMessage('Update progress successfully');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw error;
      }
    }
  }

  async calculateCompletionRates(): Promise<{ completionRate: number }> {
    const allProgress = await this.progressModel.find();

    if (!allProgress || allProgress.length === 0) {
      return { completionRate: 0 }; // Trả về 0 nếu không có dữ liệu
    }

    let totalUsers = 0;
    let completedUsers = 0;

    for (const progress of allProgress) {
      if (Array.isArray(progress.course)) {
        totalUsers += progress.course.length;
        completedUsers += progress.course.filter(
          (course) => course.status === 'completed',
        ).length;
      }
    }
    const completionRate =
      totalUsers === 0 ? 0 : (completedUsers / totalUsers) * 100;
    return {
      completionRate: Number(completionRate.toFixed(2)),
    };
  }

  async calculateAverageProgress(): Promise<{ averageProgress: number }> {
    const allProgress = await this.progressModel.find();

    // Tổng tiến độ và tổng số người dùng
    let totalProgress = 0;
    let totalUsers = 0;

    for (const progress of allProgress) {
      for (const course of progress.course) {
        totalProgress += course.progress || 0;
        totalUsers += 1;
      }
    }

    // Tính trung bình tiến độ
    const averageProgress = totalUsers === 0 ? 0 : totalProgress / totalUsers;

    return { averageProgress: Number(averageProgress.toFixed(2)) };
  }

  async getCertificate(certicateDto: CertificateDto) {
    const { userId, courseId } = certicateDto;

    try {
      //Validate userId and courseId
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException(`UserId: ${userId} Invalid format`);
      }

      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException(`CourseId: ${courseId} Invalid format`);
      }
      //----------------End----------------//


      //Check if user exist
      const user = await this.userService.findOne(userId);
      //----------------End----------------//


      //Check if course is completed
      const courseProgress = await this.progressModel.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (!courseProgress) {
        throw new BadRequestException(`Progress for user ${userId} not found.`);
      }

      const course = courseProgress.course.find(
        (course: any) => course.courseId.toString() === courseId,
      );

      if (!course) {
        throw new BadRequestException(`Course ${courseId} not found.`);
      }
      const courseDetail = await this.courseService.findOne(courseId);

      if (course.progress < 100) {
        throw new BadRequestException(`Course ${courseId} not completed.`);
      }
      //----------------End----------------//


      this.mailerService.sendMail({
        to: user.email,
        subject: 'Congratulation! You have received a certificate',
        template: 'certificate',
        context: {
          name: user.fullname,
          courseTitle: courseDetail.title,
        },
      })

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(error.message);
    }
  }
}
