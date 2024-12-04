import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubCategory } from '../entities/sub-category.entity';
import { Model, Types } from 'mongoose';
import { Category } from '../entities/category.entity';
import aqp from 'api-query-params';
import { SlugService } from 'src/utils/slug.service';
import { CreateSubCategoryDto } from '../dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from '../dto/update-sub-category.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategory>,
    private slugService: SlugService
  ) { }

  isCategoryExist = async (_id: Types.ObjectId) => {
    if (!Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('Invalid categoryId format');
    }
    return this.categoryModel.exists({ _id: new Types.ObjectId(_id) }).exec();
  }

  isSubCategoryExistByName = async (_idCate: Types.ObjectId, name: string) => {
    const isExist = await this.subCategoryModel.exists({ name, categoryId: _idCate }).exec();

    if (isExist) {
      return true;
    }
    return false;
  }

  async create(categoryId: Types.ObjectId, createSubCategoryDto: CreateSubCategoryDto[]) {
    const subcategories = [];

    const isExistCategory = await this.isCategoryExist(categoryId);

    if (!isExistCategory) {
      throw new BadRequestException('Category not found');
    }

    for (const subcate of createSubCategoryDto) {
      const { name } = subcate;
      const isExist = await this.isSubCategoryExistByName(categoryId, name);
      if (isExist) {
        throw new BadRequestException(`SubCategory ${name} is already exist`);
      }

      const subcategory = new this.subCategoryModel({
        name,
        slug: this.slugService.createSlug(name),
        categoryId: new Types.ObjectId(categoryId)
      });
      await subcategory.save();
      subcategories.push(subcategory);

      await this.categoryModel.findByIdAndUpdate(categoryId, {
        $addToSet: { subCategoryId: subcategory._id }
      });
    }

    return {
      subcategories: subcategories,
      message: 'SubCategory created successfully'
    };
  }

  async updateSubCategory(subCategoryId: string, updateSubCategoryDto: CreateSubCategoryDto) {
    const subCategory = await this.findOne(subCategoryId);

    if (!subCategory) {
      throw new BadRequestException('SubCategory not found');
    }

    subCategory.name = updateSubCategoryDto.name;
    subCategory.slug = this.slugService.createSlug(updateSubCategoryDto.name);

    await subCategory.save();

    return {
      subCategory: subCategory,
      message: `SubCategory ${subCategory.name} updated successfully`
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) {
      current = 1;
    }
    if (!pageSize) {
      pageSize = 10;
    }

    const totalItem = (await this.subCategoryModel.find(filter)).length;
    const totalPage = Math.ceil(totalItem / pageSize);
    let skip = (current - 1) * pageSize;

    const results = await this.subCategoryModel
      .find(filter)
      .limit(pageSize)
      .skip(skip);

    return { results, totalPage };
  }

  async findOne(id: string) {
    const subCategory = await this.subCategoryModel.findById(id).exec();
    if (!subCategory) {
      throw new BadRequestException('SubCategory not found');
    }
    return subCategory;
  }

  async findByCategory(categoryId: string) {
    const subCategories = await this.subCategoryModel.find
      ({ categoryId: categoryId }).exec();

    if (!subCategories || subCategories.length === 0) {
      throw new BadRequestException('No SubCategory found');
    }

    return subCategories;
  }

  async findByName(name: string) {
    const regex = new RegExp(name, 'i');

    const subCategories = await this.subCategoryModel.find({ name: regex }).exec();

    if (!subCategories || subCategories.length === 0) {
      throw new BadRequestException('No SubCategory found');
    }

    return subCategories;
  }

  async findBySlug(slug: string) {
    const subCategory = await this.subCategoryModel.findOne({ slug }).exec();
    if (!subCategory) {
      throw new BadRequestException('SubCategory not found');
    }
    return subCategory;
  }


  update(id: number, updateSubCategoryDto: UpdateSubCategoryDto) {
    return `This action updates a #${id} subCategory`;
  }

  async removeSubcategory(subCategoryId: string) {
    const subCategory = await this.subCategoryModel.findById(subCategoryId);
    if (!subCategory) {
      throw new BadRequestException('SubCategory not found');
    }

    await this.subCategoryModel.findByIdAndDelete(subCategoryId);

    await this.categoryModel.findByIdAndUpdate(subCategory.categoryId, {
      $pull: { subCategoryId: subCategoryId },
    });

    return {
      message: `SubCategory ${subCategory.name} removed successfully`,
    };
  }


}
