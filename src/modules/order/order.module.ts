import { Module } from '@nestjs/common';
import { OrderController } from './controller/order.controller';
import { OrderService } from './services/order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './entities/order.entity';
import { OrderDetailSchema } from './entities/order-detail.entity';
import { CourseSchema } from '../course/entities/course.entity';
import { UserSchema } from '../user/entities/user.entity';
import { OrderDetailService } from './services/order-detail.service';
import { UserService } from '../user/user.service';
import { PurchasedSchema } from './entities/purchased.entity';
import { PurchasedService } from './services/purchased.service';
import { ProgressSchema } from '../course/entities/progress.entity';
import { ProgressService } from '../course/services/progess.service';
import { CourseModule } from '../course/course.module';
import { CourseService } from '../course/services/course.service';
import { SlugService } from 'src/utils/slug.service';
import { CategoryModule } from '../category/category.module';
import { CategorySchema } from '../category/entities/category.entity';
import { CategoryService } from '../category/services/category.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'OrderDetail', schema: OrderDetailSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Purchased', schema: PurchasedSchema },
      { name: 'Progress', schema: ProgressSchema },
      { name: 'Category', schema: CategorySchema },
    ]),
    CourseModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderDetailService,
    UserService,
    PurchasedService,
    ProgressService,
    CourseService,
    CategoryService,
    SlugService,
  ],
})
export class OrderModule { }
