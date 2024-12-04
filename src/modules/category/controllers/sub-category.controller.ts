import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubCategoryService } from '../services/sub-category.service';
import { CreateSubCategoryDto } from '../dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from '../dto/update-sub-category.dto';
import { Types } from 'mongoose';
import { Public } from 'src/decorator/custom';

@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) { }

  @Post('/create/:categoryId')
  create(@Param('categoryId') categoryId: Types.ObjectId, @Body() createSubCategoryDto: CreateSubCategoryDto[]) {
    return this.subCategoryService.create(categoryId, createSubCategoryDto);
  }

  @Post('/update/:subCategoryId')
  updateSubCategory(@Param('subCategoryId') subCategoryId: string, @Body() updateSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoryService.updateSubCategory(subCategoryId, updateSubCategoryDto);
  }

  @Get()
  @Public()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.subCategoryService.findAll(query, +current, +pageSize);
  }

  @Get('/id=:id')
  findOne(@Param('id') id: string) {
    return this.subCategoryService.findOne(id);
  }

  @Get('/category=:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.subCategoryService.findByCategory(categoryId);
  }

  @Get('/name=:name')
  findByName(@Param('name') name: string) {
    return this.subCategoryService.findByName(name);
  }

  @Get(':slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.subCategoryService.findBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubCategoryDto: UpdateSubCategoryDto) {
    return this.subCategoryService.update(+id, updateSubCategoryDto);
  }

  @Post('/remove-subcategory')
  async removeSubcategory(@Body() body: { subCategoryId: string }) {
    const { subCategoryId } = body;
    return this.subCategoryService.removeSubcategory(subCategoryId);
  }

}
