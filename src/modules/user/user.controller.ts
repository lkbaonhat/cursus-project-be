import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateDeleteUserDto,
  UpdateUserDto,
  UpdateUserSettingDto,
} from './dto/update-user.dto';
import { Public, ResponseMessage } from 'src/decorator/custom';
import { Types } from 'mongoose';
import { UpdatePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('become-instructor/:userId')
  @ResponseMessage('User registered as instructor')
  requestBecomeInstructor(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.requestBecomeInstructor(userId, updateUserDto);
  }

  @Post('approve-instructor/:userId')
  @ResponseMessage('Approve become instructor successfully')
  approveBecomeInstructor(
    @Param('userId') userId: string,
    @Body('status') status: 'approved' | 'rejected',
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.userService.approveBecomeInstructor(
      userId,
      status,
      rejectionReason,
    );
  }

  @Post('update-user/:userId')
  @ResponseMessage('Update user successfully')
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserSettingDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Get('all-users-with-status')
  async findAllAccountWithStatus(@Query('status') status: string) {
    return this.userService.findAllAccountWithStatus(status);
  }

  @Get('/find-all')
  async findAllNoPagination() {
    return this.userService.findAllNoPagination();
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.userService.findAll(query, +current, +pageSize);
  }

  @Get('/id=:id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Get('/instructor-profile/:id')
  @Public()
  findInstructorProfile(@Param('id') id: string) {
    return this.userService.findInstructorById(id);
  }

  @Get('/all-instructors')
  @Public()
  findAllInstructors() {
    return this.userService.findAllInstructors();
  }

  @Get('/popular-instructors')
  @Public()
  async findPopularInstructors(@Query() query: string) {
    return this.userService.findPopularInstructors(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Post('delete/:id')
  @ResponseMessage('Delete successfully')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('/count-active-users')
  async countActiveUsers() {
    const activeUserCount = await this.userService.countActiveUsers();
    return { activeUserCount };
  }

  @Post(':userId/subscribe/:instructorId')
  async subscribeToChannel(
    @Param('userId') userId: string,
    @Param('instructorId') instructorId: string,
  ) {
    return this.userService.subscribeToChannel(
      new Types.ObjectId(userId),
      new Types.ObjectId(instructorId),
    );
  }

  @Post(':userId/unsubscribe/:instructorId')
  async unsubscribeFromChannel(
    @Param('userId') userId: string,
    @Param('instructorId') instructorId: string,
  ) {
    return this.userService.unsubscribeFromChannel(
      new Types.ObjectId(userId),
      new Types.ObjectId(instructorId),
    );
  }
  @Get(':userId/is-instructor-subscribed/:instructorId')
  async isInstructorSubscribed(
    @Param('userId') userId: string,
    @Param('instructorId') instructorId: string,
  ) {
    return this.userService.isInstructorSubscribed(
      new Types.ObjectId(userId),
      new Types.ObjectId(instructorId),
    );
  }

  @Get(':userId/subscribed-instructors')
  async getSubscribedInstructors(@Param('userId') userId: string) {
    const instructors = await this.userService.getSubscribedInstructors(
      new Types.ObjectId(userId),
    );
    return { subscribedInstructors: instructors };
  }
  @Get(':userId/liked-courses')
  async getLikedCourses(@Param('userId') userId: string) {
    const courses = await this.userService.getLikedCourses(
      new Types.ObjectId(userId),
    );
    return { likedCourses: courses };
  }
  @Post('change-password/:userId')
  async changePassword(
    @Param('userId') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.changePassword(userId, updatePasswordDto);
  }
}
