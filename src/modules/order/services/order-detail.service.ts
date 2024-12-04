import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDetailDto } from '../dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from '../dto/update-order-detail.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderDetail } from '../entities/order-detail.entity';
import { Course } from 'src/modules/course/entities/course.entity';

@Injectable()
export class OrderDetailService {
  constructor(
    @InjectModel(OrderDetail.name) private readonly orderDetailModel: Model<OrderDetail>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) { }

  async createOrderDetails(orderDetails: CreateOrderDetailDto[]) {
    try {
      const createdOrderDetails = [];

      for (const item of orderDetails) {
        const { orderId, courseId, quantity, price } = item;

        const orderDetail = await this.orderDetailModel.create({
          orderId,
          courseId: new Types.ObjectId(courseId),
          price,
          quantity,
        });

        const course = await this.courseModel.findByIdAndUpdate(courseId, {
          $inc: { totalSold: quantity },
        });

        course.save();

        createdOrderDetails.push(orderDetail);
      }

      return createdOrderDetails;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new Error(error.message);
    }
  }

  findAll() {
    return `This action returns all orderDetail`;
  }

  async findOne(id: string) {
    return await this.orderDetailModel.findById(id).exec();
  }

  update(id: number, updateOrderDetailDto: UpdateOrderDetailDto) {
    return `This action updates a #${id} orderDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderDetail`;
  }
}
