import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchased } from '../entities/purchased.entity';
import { CreatePurchasedDto } from '../dto/create-purchased.dto';

@Injectable()
export class PurchasedService {
  constructor(
    @InjectModel('Purchased') private purchasedModel: Model<Purchased>,
  ) {}

  async create(createPurchasedDto: CreatePurchasedDto) {
    const { ...payload } = createPurchasedDto;
    try {
      const purchased = await this.purchasedModel.create({ ...payload });
      if (!purchased) {
        throw new BadRequestException('Purchased cannot be created');
      }
      return purchased;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error.message);
      }
    }
  }

  async findOnePurchasedByUserId(userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException(`Id: ${userId} Invalid format`);
      }

      const existUser = await this.purchasedModel.findOne({
        userId: new Types.ObjectId(userId),
      });
      return existUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error.message);
      }
    }
  }

  async findCourseByUserId(userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException(`User id invalid format`);
      }
      const listCourseId = await this.purchasedModel.find({
        userId: new Types.ObjectId(userId),
      });
      return listCourseId;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error.message);
      }
    }
  }
}
