import { Module } from '@nestjs/common';
import { SubCategoryService } from './services/sub-category.service';
import { SubCategoryController } from './controllers/sub-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategory, SubCategorySchema } from './entities/sub-category.entity';
import { Category, CategorySchema } from './entities/category.entity';
import { SlugService } from 'src/utils/slug.service';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SubCategory.name, schema: SubCategorySchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
  ],
  controllers: [SubCategoryController, CategoryController],
  providers: [SubCategoryService, SlugService, CategoryService],
})
export class SubCategoryModule { }
