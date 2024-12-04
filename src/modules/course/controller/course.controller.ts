import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorator/custom';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { Types } from 'mongoose';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('/all')
  @Public()
  findAll(@Query('status') status: string) {
    return this.courseService.findAll(status);
  }

  @Get('/approved-and-rejected')
  @Public()
  findApprovedAndRejected() {
    return this.courseService.findApprovedAndRejected();
  }

  @Get('/newest')
  @Public()
  findAllNewestFollowStatus(@Query() query: string) {
    return this.courseService.findAllNewestFollowStatus(query);
  }

  @Get('/course-instructor/:instructorId')
  @ResponseMessage('Get all course by instructor successfully')
  findAllCourseByInstructorId(
    @Param('instructorId') instructorId: string,
    @Query('status') status: string,
  ) {
    return this.courseService.findAllCourseByInstructor(instructorId, status);
  }

  @Get('/course-purchased/:userId')
  @ResponseMessage('Get all course purchased by user successfully')
  findAllCoursePurchasedByUserId(@Param('userId') userId: string) {
    return this.courseService.findAllCoursePurchasedByUser(userId);
  }

  @Get('/id=:id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Get('/search=:name')
  findByName(@Param('name') name: string) {
    return this.courseService.findByName(name);
  }

  @Get('/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.courseService.findBySlug(slug);
  }

  @Get('/category/category=:categoryId')
  @Public()
  findCourseByCategoryId(
    @Param('categoryId') categoryId: string,
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.courseService.findCourseByCategoryId(
      categoryId,
      pageNumber,
      pageSize,
    );
  }

  @Post('/create')
  @ResponseMessage('Create course successfully')
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Post('/update/:id')
  @ResponseMessage('Update successfully')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Post('/update/status/:id')
  @ResponseMessage('Course status updated successfully')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.courseService.updateStatus(id, status, rejectionReason);
  }

  @Post('/update-view/id=:id')
  @Public()
  @ResponseMessage('Update view successfully')
  updateView(@Param('id') id: string) {
    return this.courseService.updateViewById(id);
  }

  @Post('/update-view/slug=:slug')
  @Public()
  @ResponseMessage('Update view successfully')
  updateViewBySlug(@Param('slug') slug: string) {
    return this.courseService.updateViewBySlug(slug);
  }

  @Post('/publish-course/:courseId')
  @ResponseMessage('Publish course successfully')
  publishCourse(@Param('courseId') courseId: string) {
    return this.courseService.publishCourse(courseId);
  }

  @Post('/enroll')
  @ResponseMessage('Enroll successfully')
  enroll(@Body() id: string) {
    return this.courseService.enrollTotal(id);
  }

  @Post('/delete/:id')
  @ResponseMessage('Delete successfully')
  remove(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.remove(id, updateCourseDto);
  }
  @Get('/statistics/dashboard')
  @Public()
  getDashboardStatistics() {
    return this.courseService.getDashboardStatistics();
  }

  @Post(':courseId/like/:userId')
  async likeCourse(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ) {
    return this.courseService.likeCourse(
      new Types.ObjectId(courseId),
      new Types.ObjectId(userId),
    );
  }
  @Post(':courseId/dislike/:userId')
  async dislikeCourse(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ) {
    return this.courseService.dislikeCourse(
      new Types.ObjectId(courseId),
      new Types.ObjectId(userId),
    );
  }
  @Get(':courseId/validate-course-reaction/:userId')
  async validateCourseReaction(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ) {
    return this.courseService.validateCourseReaction(
      new Types.ObjectId(courseId),
      new Types.ObjectId(userId),
    );
  }
}
