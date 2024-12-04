import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../entities/order.entity';
import { Model, Types } from 'mongoose';
import { Course } from 'src/modules/course/entities/course.entity';
import { OrderDetailService } from './order-detail.service';
import aqp from 'api-query-params';
import {
  CreateOrderDetailDto,
  GetOrderDetailDto,
} from '../dto/create-order-detail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/modules/user/user.service';
import { PurchasedService } from './purchased.service';
import { CreatePurchasedDto } from '../dto/create-purchased.dto';
import { ProgressService } from 'src/modules/course/services/progess.service';
import { CreateProgressDto } from 'src/modules/course/dto/create-progresss.dto';
import { SectionService } from 'src/modules/course/services/section.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly userService: UserService,
    private readonly orderDetailService: OrderDetailService,
    private readonly mailerService: MailerService,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private readonly purchasedService: PurchasedService,
    private readonly progressService: ProgressService,
    private readonly sectionService: SectionService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    orderDetails: CreateOrderDetailDto[],
  ) {
    const { userId, ...payload } = createOrderDto;

    // Kiểm tra người dùng tồn tại
    const userExist = await this.userService.findOne(userId.toString());
    if (!userExist) {
      throw new BadRequestException(`User ${userId} not found`);
    }

    // Tạo đơn hàng
    const order = await this.orderModel.create({
      ...payload,
      userId: new Types.ObjectId(userId),
    });
    if (!order) {
      throw new BadRequestException('Order cannot be created');
    }

    // Tạo chi tiết đơn hàng
    const createdOrderDetails =
      await this.orderDetailService.createOrderDetails(
        orderDetails.map((detail) => ({ ...detail, orderId: order._id })),
      );

    // Xử lý cập nhật tiến độ khóa học
    const courseIds = createdOrderDetails.map((detail) => detail.courseId);
    const sectionsByCourse = await Promise.all(
      courseIds.map((courseId) =>
        this.sectionService.findAllSectionByCourseId(courseId),
      ),
    );

    const progressData = courseIds.map((courseId, index) => {
      const sections = sectionsByCourse[index];
      return {
        courseId: new Types.ObjectId(courseId),
        status: 'not-learn',
        progress: 0,
        sections: sections.map((section) => ({
          sectionId: section._id,
          status: 'not-learn',
          progress: 0,
          lectures: section.listLecture.map((lecture) => ({
            lectureId: lecture._id,
            status: 'not-learn',
          })),
          quizzes: section.listQuiz.map((quiz) => ({
            quizId: quiz._id,
            status: 'not-learn',
            score: 0,
          })),
          assignments: section.listAssignment.map((assignment) => ({
            assignmentId: assignment._id,
            status: 'not-learn',
          })),
        })),
      };
    });

    await this.progressCourse({
      userId: new Types.ObjectId(userExist._id),
      course: progressData,
    });

    // Gắn cờ mua khóa học
    await this.purchaseCourse({ userId: userExist._id, courseIds });

    // Chuẩn bị dữ liệu email
    const courses = await this.courseModel.find({ _id: { $in: courseIds } });
    const items = createdOrderDetails.map((detail) => {
      const course = courses.find((course) =>
        course._id.equals(detail.courseId),
      );
      return {
        title: course?.title,
        image: course?.image,
        price: detail.price,
        quantity: detail.quantity,
        totalPrice: detail.price * detail.quantity,
      };
    });

    // Gửi email xác nhận
    await this.mailerService.sendMail({
      to: userExist.email,
      subject: 'Order created',
      template: 'order-confirm',
      context: {
        email: userExist?.email,
        name: userExist?.fullname,
        order: order.toObject(),
        items,
      },
    });

    return order.toObject();
  }

  async purchaseCourse(createPurchasedDto: CreatePurchasedDto) {
    const { userId, courseIds } = createPurchasedDto;
    try {
      const userExist = await this.userService.findOne(userId.toString());
      if (!userExist) {
        throw new BadRequestException(`UserId: ${userExist} not found!`);
      }

      const purchaseExistByUserId =
        await this.purchasedService.findOnePurchasedByUserId(userId.toString());

      if (purchaseExistByUserId) {
        const uniqueCourses = courseIds.filter(
          (courseId) =>
            !purchaseExistByUserId.courseIds.some((existingId) =>
              existingId.equals(courseId),
            ),
        );

        if (uniqueCourses.length > 0) {
          purchaseExistByUserId.courseIds.push(
            ...uniqueCourses.map((id) => new Types.ObjectId(id)),
          );
          await purchaseExistByUserId.save();
        }
      } else {
        await this.purchasedService.create({
          userId: new Types.ObjectId(userId),
          courseIds: courseIds.map((id) => new Types.ObjectId(id)),
        });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(error.message);
    }
  }

  async progressCourse(createProgress: CreateProgressDto) {
    const { userId, course } = createProgress;
    try {
      const userExist = await this.userService.findOne(userId.toString());
      if (!userExist) {
        throw new BadRequestException(`UserId: ${userExist} not found!`);
      }

      const progressExistByUserId =
        await this.progressService.findOneProgressByUserId(userId.toString());

      if (progressExistByUserId) {
        const uniqueCourses = course.filter(
          (course) =>
            !progressExistByUserId.course.some((existingCourse) =>
              existingCourse.courseId.equals(course.courseId),
            ),
        );

        if (uniqueCourses.length > 0) {
          progressExistByUserId.course.push(
            ...uniqueCourses.map((courseItem) => ({
              ...courseItem,
              sections: courseItem.sections.map((section) => ({
                sectionId: section.sectionId,
                status: section.status,
                progress: section.progress,
                lectures: section.lectures.map((lecture) => ({
                  lectureId: lecture.lectureId,
                  status: lecture.status,
                })),
                quizzes: section.quizzes.map((quiz) => ({
                  quizId: quiz.quizId,
                  status: quiz.status,
                  score: quiz.score,
                })),
                assignments: section.assignments.map((assignment) => ({
                  assignmentId: assignment.assignmentId,
                  status: assignment.status,
                })),
              })),
            })),
          );
          await progressExistByUserId.save();
        }
      } else {
        await this.progressService.createProgress({
          userId: new Types.ObjectId(userId),
          course: course.map((courseItem) => ({
            ...courseItem,
            sections: courseItem.sections.map((section) => ({
              sectionId: section.sectionId,
              status: section.status,
              progress: section.progress,
              lectures: section.lectures.map((lecture) => ({
                lectureId: lecture.lectureId,
                status: lecture.status,
              })),
              quizzes: section.quizzes.map((quiz) => ({
                quizId: quiz.quizId,
                status: quiz.status,
                score: quiz.score,
              })),
              assignments: section.assignments.map((assignment) => ({
                assignmentId: assignment.assignmentId,
                status: assignment.status,
              })),
            })),
          })),
        });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(error.message);
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItem = (await this.orderModel.find(filter)).length;
    const totalPage = Math.ceil(totalItem / pageSize);
    let skip = (current - 1) * pageSize;

    const results = await this.orderModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    return { results, totalPage };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const order = await this.orderModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'orderdetails',
            localField: '_id',
            foreignField: 'orderId',
            as: 'orderDetails',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $project: {
            userId: 0,
            'user.password': 0,
          },
        },
      ])
      .exec();

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return order[0];
  }

  async findAllOrderOfUser(userId: string) {
    const orders = await this.orderModel.find({ userId }).exec();
    if (!orders) {
      throw new BadRequestException('Order not found');
    }
    for (const order of orders) {
    }
  }

  async userOrder(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid id');
    }

    const order = await this.orderModel
      .aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'orderdetails',
            localField: '_id',
            foreignField: 'orderId',
            as: 'orderDetails',
          },
        },
      ])
      .exec();

    if (!order || order.length === 0) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  async userOneOrder(getOrderDetailDto: GetOrderDetailDto) {
    const { userId, courseId } = getOrderDetailDto;

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course id');
    }

    const order = await this.orderModel
      .aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'orderdetails',
            localField: '_id',
            foreignField: 'orderId',
            as: 'orderDetail',
          },
        },
        {
          $match: { 'orderDetail.courseId': new Types.ObjectId(courseId) },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ])
      .exec();

    if (!order || order.length === 0) {
      return false;
    }

    return true;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  //-----------------calculate MonthlyRevenue---------------------------//
  async getMonthlyRevenue(year: number) {
    const results = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      {
        $project: {
          month: '$_id',
          totalRevenue: 1,
          _id: 0,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    // Bổ sung các tháng có doanh thu bằng 0
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = results.find((r) => r.month === month);
      return found ? found : { month, totalRevenue: 0 };
    });

    return monthlyRevenue;
  }
  //---------------end Calculate MonthlySales-----------------------//

  async getWeeklyRevenue() {
    // Lấy ngày bắt đầu và kết thúc của tuần hiện tại
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay() + 1); // Thứ Hai
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Chủ Nhật
    lastDayOfWeek.setHours(23, 59, 59, 999);

    //  doanh thu từng ngày
    const results = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfWeek, $lt: lastDayOfWeek },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      {
        $project: {
          dayOfWeek: {
            $cond: {
              if: { $eq: ['$_id', 1] },
              then: 7,
              else: { $subtract: ['$_id', 1] },
            },
          },
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);

    // doanh thu cho các ngày không có giao dịch
    const weeklyRevenue = Array.from({ length: 7 }, (_, i) => {
      const dayOfWeek = i + 1;
      const found = results.find((r) => r.dayOfWeek === dayOfWeek);
      return found ? found : { dayOfWeek, totalRevenue: 0 };
    });

    return weeklyRevenue;
  }
}
