import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from '../entities/course.entity';
import { Model, Types } from 'mongoose';
import { SlugService } from 'src/utils/slug.service';
import { SectionService } from './section.service';
import { UserService } from 'src/modules/user/user.service';
import { PurchasedService } from 'src/modules/order/services/purchased.service';
@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private slugService: SlugService,
    private readonly sectionService: SectionService,
    private readonly userService: UserService,
    private readonly purchasedService: PurchasedService,
  ) { }

  async isCourseExist(courseId: string) {
    try {
      const course = await this.courseModel.findById(courseId);
      return course ? true : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(createCourseDto: CreateCourseDto) {
    const { ...payload } = createCourseDto;

    const course = await this.courseModel.create({
      ...payload,
      subCategoryId: new Types.ObjectId(payload.subCategoryId),
      slug: this.slugService.createSlug(payload.title),
      userId: new Types.ObjectId(payload.userId),
    });

    if (!course) {
      throw new BadRequestException('Course cannot be created');
    }

    return {
      courseId: course._id,
    };
  }

  async getAllInfoOfCourse(id: string) {
    const courseInfo = [];
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    const sections = await this.sectionService.findAllSectionByCourseId(
      course._id.toString(),
    );
    if (!sections) {
      throw new BadRequestException('Section is empty');
    }

    courseInfo.push({
      course,
      sections: sections,
    });
  }

  async findAll(status: string) {
    const filter = status ? { status: status } : {};
    // await this.becomeBestsellerCourse();

    const course = await this.courseModel.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $project: {
          userId: 0,
          subCategoryId: 0,
          'author.password': 0,
        },
      },
    ]);

    if (!course || course.length === 0) {
      return { message: 'Course is empty' };
    }

    return course;
  }

  async findTop8CoursesTotalSoldHighest() {
    try {
      const courses = await this.courseModel
        .find()
        .sort({ totalSold: -1 })
        .limit(8);
      if (!courses) {
        throw new BadRequestException('Course not found');
      }
      return courses;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async becomeBestsellerCourse() {
    try {
      const top8Course = await this.findTop8CoursesTotalSoldHighest();
      if (top8Course) {
        for (let i = 0; i < top8Course.length; i++) {
          top8Course[i].isBestseller = true;
          await top8Course[i].save();
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllCourseByInstructor(userId: string, status: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      const isUserExist = await this.userService.isUserExist(userId);
      if (isUserExist) {
        const courses = await this.courseModel
          .find({
            userId: new Types.ObjectId(userId),
            status: status ? status : 'approved',
          })
          .populate({
            path: 'subCategoryId',
            select: 'name',
          })
          .populate({
            path: 'userId',
            select: 'fullname',
          });
        if (!courses) {
          throw new BadRequestException('Course not found');
        }
        return courses;
      } else {
        throw new BadRequestException('User not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async findAllCoursePurchasedByUser(userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      const isUserExist = await this.userService.isUserExist(userId);
      if (isUserExist) {
        let listCourseId =
          await this.purchasedService.findCourseByUserId(userId);

        if (!listCourseId) {
          throw new BadRequestException('Cannot find course purchased by user');
        }

        const flattenedCourseIds = listCourseId.flatMap(
          (item) => item.courseIds,
        );

        const purchasedDate =
          listCourseId.length > 0 ? listCourseId[0].get('createdAt') : null;

        const listCoursePurchased = [];
        for (const courseId of flattenedCourseIds) {
          const course = await this.courseModel
            .findOne(courseId)
            .populate({
              path: 'subCategoryId',
              select: 'name',
            })
            .populate({
              path: 'userId',
              select: 'fullname',
            });
          if (!course) {
            throw new BadRequestException(
              `Course with ID ${courseId} not found`,
            );
          }
          listCoursePurchased.push({
            ...course.toObject(),
            purchasedDate: purchasedDate,
          });
        }
        return listCoursePurchased;
      } else {
        throw new BadRequestException('User not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async findApprovedAndRejected() {
    const courses = await this.courseModel.aggregate([
      { $match: { status: { $in: ['approved', 'rejected'] } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $project: {
          userId: 0,
          subCategoryId: 0,
          'author.password': 0,
        },
      },
    ]);

    if (!courses || courses.length === 0) {
      return { message: 'No approved or rejected courses found' };
    }

    return courses;
  }

  async findAllNewestFollowStatus(query: string) {
    const filter = query ? { status: 'approved' } : {};
    const course = await this.courseModel
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $lookup: {
            from: 'subcategories',
            localField: 'subCategoryId',
            foreignField: '_id',
            as: 'subCategory',
          },
        },
        {
          $project: {
            userId: 0,
            subCategoryId: 0,
            'author.password': 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .limit(9);

    if (!course || course.length === 0) {
      return { message: 'Course is empty' };
    }

    return course;
  }

  async findOne(id: string) {
    const course = await this.courseModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $project: {
          userId: 0,
          subCategoryId: 0,
          'author.password': 0,
        },
      },
    ]);

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    return course[0];
  }

  async findByName(name: string) {
    const regex = new RegExp(name, 'i');
    const course = await this.courseModel.aggregate([
      { $match: { title: regex } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $project: {
          userId: 0,
          subCategoryId: 0,
          'author.password': 0,
        },
      },
    ]);

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    return course;
  }

  async findBySlug(slug: string) {
    const course = await this.courseModel.aggregate([
      { $match: { slug } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subCategory',
        },
      },
      {
        $project: {
          userId: 0,
          subCategoryId: 0,
          'author.password': 0,
        },
      },
    ]);

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    return course[0];
  }

  async findCourseByCategoryId(
    categoryId: string,
    pageNumber?: number,
    pageSize?: number,
  ) {
    const page = pageNumber || 1;
    const limit = pageSize || 10;
    const skip = (page - 1) * limit;
    try {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid subcategory ID format');
      }

      const courses = await this.courseModel
        .find({ status: 'approved' })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'subCategoryId',
          match: { categoryId: new Types.ObjectId(categoryId) },
          select: 'name',
        })
        .populate({
          path: 'userId',
          select: 'fullname role',
        });
      const filterCourses = courses.filter((course) => course.subCategoryId);

      return filterCourses;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error.message);
      }
    }
  }

  async enrollTotal(id: string) {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new BadRequestException('Course not exits');
    }

    course.totalErrolled += 1;
    await course.save();
  }

  async updateViewById(id: string) {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new BadRequestException('Course not exits');
    }

    course.totalView += 1;
    await course.save();
  }

  async updateViewBySlug(slug: string) {
    const course = await this.courseModel.findOne({ slug });

    if (!course) {
      throw new BadRequestException('Course not exits');
    }

    course.totalView += 1;
    await course.save();
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const { image, introVideo, price, requireLogIn, requireEnroll, discount } =
      updateCourseDto;
    const section = await this.courseModel.findByIdAndUpdate(id, {
      image,
      introVideo,
      price,
      requireLogIn,
      requireEnroll,
      discount,
    });
    if (!section) {
      throw new BadRequestException(`Id: ${id} not found`);
    }
    section.save();
  }

  async updateStatus(
    courseId: string,
    status: 'pending' | 'approved' | 'rejected',
    rejectionReason?: string,
  ) {
    try {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid course ID format');
      }

      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new BadRequestException('Course does not exist');
      }

      if (course.status === status) {
        throw new BadRequestException(`Course is already ${status}`);
      }

      if (status === 'rejected' && !rejectionReason) {
        throw new BadRequestException(
          'Rejection reason is required when rejecting a course',
        );
      }

      // Update course status
      course.status = status;
      if (status === 'approved') {
        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(now);
        course.approvedAt = formattedDate;
        course.rejectionReason = undefined; // Clear rejection reason if previously rejected
      } else if (status === 'rejected') {
        course.rejectionReason = rejectionReason;
      } else {
        course.rejectionReason = undefined; // Clear rejection reason if transitioning to pending
      }

      await course.save();
      return { message: `Course status updated to ${status}` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log the error for debugging
      console.error('Error updating course status:', error);
      throw new Error('An unexpected error occurred');
    }
  }

  async getDashboardStatistics() {
    return {
      totalSales: {
        total: 125000,
        new: 12500,
      },
      totalEnroll: {
        total: 1500,
        new: 150,
      },
      totalCourses: {
        total: 100,
        new: 10,
      },
      totalStudents: {
        total: 1200,
        new: 120,
      },
      recentTransactions: [
        {
          id: 1,
          courseName: 'Complete JavaScript Course',
          studentName: 'John Doe',
          amount: 499,
          date: '2024-01-15',
        },
        {
          id: 2,
          courseName: 'React Development Bootcamp',
          studentName: 'Jane Smith',
          amount: 699,
          date: '2024-01-14',
        },
        {
          id: 3,
          courseName: 'Python for Beginners',
          studentName: 'Mike Johnson',
          amount: 299,
          date: '2024-01-13',
        },
        {
          id: 4,
          courseName: 'Web Design Masterclass',
          studentName: 'Sarah Williams',
          amount: 599,
          date: '2024-01-12',
        },
        {
          id: 5,
          courseName: 'Data Science Fundamentals',
          studentName: 'Tom Brown',
          amount: 799,
          date: '2024-01-11',
        },
      ],
      popularCourses: [
        {
          id: 1,
          name: 'Complete JavaScript Course',
          instructor: 'John Smith',
          rating: 4.8,
          students: 450,
          price: 499,
        },
        {
          id: 2,
          name: 'React Development Bootcamp',
          instructor: 'Sarah Johnson',
          rating: 4.9,
          students: 380,
          price: 699,
        },
        {
          id: 3,
          name: 'Python for Beginners',
          instructor: 'Mike Wilson',
          rating: 4.7,
          students: 320,
          price: 299,
        },
        {
          id: 4,
          name: 'Web Design Masterclass',
          instructor: 'Emma Davis',
          rating: 4.8,
          students: 280,
          price: 599,
        },
        {
          id: 5,
          name: 'Data Science Fundamentals',
          instructor: 'Robert Miller',
          rating: 4.9,
          students: 250,
          price: 799,
        },
      ],
    };
  }

  async publishCourse(courseId: string) {
    try {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid course ID format');
      }
      const courseExist = await this.isCourseExist(courseId);
      if (courseExist) {
        const res = await this.courseModel.findByIdAndUpdate(courseId, {
          status: 'pending',
        });
        if (!res) {
          throw new BadRequestException('Cannot publish course');
        }
      } else {
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

  async remove(id: string, updateCourseDto: UpdateCourseDto) {
    const { isDeleted } = updateCourseDto;
    const course = await this.courseModel.findByIdAndUpdate(id, { isDeleted });
    if (!course) {
      throw new BadRequestException(`Id: ${id} not found`);
    }
    course.save();
  }

  async likeCourse(courseId: Types.ObjectId, userId: Types.ObjectId) {
    const user = await this.userService.findOne(userId.toString());
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }

    if (course.userId.toString() === userId.toString()) {
      throw new BadRequestException('Users cannot like their own courses.');
    }

    if (
      user.likedCourses.some(
        (likedCourseId) => likedCourseId.toString() === courseId.toString(),
      )
    ) {
      await this.userService.removelikeCourseItem(userId, courseId);

      await this.courseModel.findByIdAndUpdate(
        courseId,
        { $inc: { likes: -1 } },
        { new: true },
      );
    } else {
      // If course exists in dislikedCourses, remove it and decrement dislikes
      if (
        user.dislikedCourses.some(
          (dislikedCourseId) =>
            dislikedCourseId.toString() === courseId.toString(),
        )
      ) {
        await this.userService.removeDislikeCourseitem(userId, courseId);

        await this.courseModel.findByIdAndUpdate(
          courseId,
          { $inc: { dislikes: -1 } },
          { new: true },
        );
      }

      // Add course to likedCourses and increment likes
      await this.userService.likeCourse(userId, courseId);

      await this.courseModel.findByIdAndUpdate(
        courseId,
        { $inc: { likes: 1 } },
        { new: true },
      );
    }

    return { message: 'Like The Course Successfully' };
  }

  async dislikeCourse(courseId: Types.ObjectId, userId: Types.ObjectId) {
    const user = await this.userService.findOne(userId.toString());
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }

    if (
      user.dislikedCourses.some(
        (dislikedCourseId) =>
          dislikedCourseId.toString() === courseId.toString(),
      )
    ) {
      await this.userService.removeDislikeCourseitem(userId, courseId);

      await this.courseModel.findByIdAndUpdate(
        courseId,
        { $inc: { dislikes: -1 } },
        { new: true },
      );
    } else {
      // If course exists in likedCourses, remove it and decrement likes
      if (
        user.likedCourses.some(
          (likedCourseId) => likedCourseId.toString() === courseId.toString(),
        )
      ) {
        await this.userService.removelikeCourseItem(userId, courseId);

        await this.courseModel.findByIdAndUpdate(
          courseId,
          { $inc: { likes: -1 } },
          { new: true },
        );
      }

      // Add course to dislikedCourses and increment dislikes
      await this.userService.dislikeCourse(userId, courseId);

      await this.courseModel.findByIdAndUpdate(
        courseId,
        { $inc: { dislikes: 1 } },
        { new: true },
      );
    }

    return { message: 'Dislike the Course Successfully' };
  }

  async validateCourseReaction(
    courseId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const user = await this.userService.findOne(userId.toString());
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }

    if (user.likedCourses.includes(courseId)) {
      return { status: 'like' };
    }

    if (user.dislikedCourses.includes(courseId)) {
      return { status: 'dislike' };
    }

    return { status: 'none' };
  }
}
