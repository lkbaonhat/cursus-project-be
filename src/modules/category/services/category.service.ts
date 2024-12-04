import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SlugService } from 'src/utils/slug.service';
import { Category } from '../entities/category.entity';
import { SubCategory } from '../entities/sub-category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    private slugService: SlugService
  ) { }

  isCategoryExist = async (name: string) => {
    return this.categoryModel.findOne({ name }).exec();
  }

  isSubCategoryExist = async (name: string) => {
    const isSubCategoryExist = await this.subCategoryModel.exists({ name });
    if (isSubCategoryExist) {
      return true;
    }
    return false;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    const isExistCategory = await this.isCategoryExist(name);

    if (isExistCategory) {
      throw new BadRequestException('Category is already exist');
    }

    const category = new this.categoryModel({
      name,
      slug: this.slugService.createSlug(name),
    });

    await category.save();

    return {
      _id: category._id,
      name: category.name,
    };
  }

  async findAll(query: string) {
    const filter = query ? { name: new RegExp(query, 'i') } : {};
    const categories = await this.categoryModel
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'subcategories',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'subcategories',
          },
        },
      ])
      .exec();

    if (!categories || categories.length === 0) {
      return { message: 'Category is empty' };
    }

    return categories;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    const category = await this.categoryModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'subcategories',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'subcategories',
          },
        },
      ])

    if (!category || category.length === 0) {
      throw new BadRequestException('Category not found');
    }

    return category[0];
  }

  async findByName(name: string) {
    const regex = new RegExp(name, 'i');

    const category = await this.categoryModel.find({ name: regex })

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug })

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, subcategories } = updateCategoryDto;

    // Kiểm tra danh mục tồn tại
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Cập nhật tên danh mục
    if (name && name !== category.name) {
      category.name = name;
      category.slug = this.slugService.createSlug(name); // Tự động tạo slug mới
    }

    await category.save();
    return category;
  }

}
