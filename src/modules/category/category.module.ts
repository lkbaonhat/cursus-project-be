import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './entities/category.entity';
import { SubCategory, SubCategorySchema } from './entities/sub-category.entity';
import { SlugService } from 'src/utils/slug.service';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';
import { SubCategoryController } from './controllers/sub-category.controller';
import { SubCategoryService } from './services/sub-category.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: SubCategory.name, schema: SubCategorySchema }]),
  ],
  controllers: [CategoryController, SubCategoryController],
  providers: [CategoryService, SlugService, SubCategoryService],
  exports: [CategoryService, SubCategoryService],
})
export class CategoryModule { }
