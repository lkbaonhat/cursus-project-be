import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { CategoryService } from '../category/services/category.service';
import { Category, CategorySchema } from '../category/entities/category.entity';
import { SubCategory, SubCategorySchema } from '../category/entities/sub-category.entity';
import { SubCategoryService } from '../category/services/sub-category.service';
import { SlugService } from 'src/utils/slug.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, CategoryService, SubCategoryService, SlugService],
  exports: [UserService, CategoryService],
})
export class UserModule { }
