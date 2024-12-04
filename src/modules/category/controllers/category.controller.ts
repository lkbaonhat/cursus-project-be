import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorator/custom';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post('/create')
  @ResponseMessage('Category created successfully')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Post('/update/:id')
  @ResponseMessage('Category updated successfully')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Get()
  @Public()
  @ResponseMessage('Get all categories')
  findAll(@Query() query: string) {
    return this.categoryService.findAll(query);
  }

  @Get('/id=:id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Get('/name=:name')
  findByName(@Param('name') name: string) {
    return this.categoryService.findByName(name);
  }

  @Get('/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

}
