import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateDeleteUserDto,
  UpdateUserDto,
  UpdateUserSettingDto,
} from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import aqp from 'api-query-params';
import { comparePasswordHelper, hashPasswordHelper } from 'src/utils/utils';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateAuthDto, UpdateAuthDto } from 'src/auth/dto/create-auth.dto';
import { Cache } from 'cache-manager';
import { ResponseMessage } from 'src/decorator/custom';
import { CategoryService } from '../category/services/category.service';
import { UpdatePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly categoryService: CategoryService,
    private readonly mailerService: MailerService,
    @Inject('CACHE_MANAGER') private readonly cache: Cache,
  ) { }

  isEmailExist = async (email: string) => {
    const isExist = await this.userModel.exists({ email });
    if (isExist) {
      return true;
    }
    return false;
  };

  async isUserExist(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findOne(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid ID format');
      }

      const findUser = await this.userModel.findById(id);
      if (!findUser) {
        throw new BadRequestException(`User with ID: ${id} not found`);
      }

      const user = await findUser.populate('categoryId');

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(`Error: ${error.message}`);
      }
    }
  }

  async findPopularInstructors(query: string) {
    try {
      const { sort } = aqp(query);
      const results = await this.userModel
        .find({ role: 'instructor' })
        .limit(5)
        .select('-password')
        .sort({ subcribe: -1, ...sort });
      return results;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(`Error: ${error.message}`);
      }
    }
  }

  async findInstructorById(id: string) {
    try {
      const instructor = await this.userModel
        .findOne({ _id: id, role: 'instructor' })
        .select('-password');
      if (!instructor) {
        throw new BadRequestException(`Instructor not found with id ${id}`);
      }
      return instructor;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async findAllInstructors() {
    try {
      const instructors = await this.userModel
        .find({ role: 'instructor' })
        .select('-password');
      if (!instructors) {
        throw new BadRequestException(`Cannot find any instructor`);
      }
      return instructors;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async create(createUserDto: CreateUserDto) {
    const { fullname, email, password } = createUserDto;

    //check email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email ${email} is exits. Please try again`,
      );
    }
    //end

    //hashPassword
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      fullname,
      email,
      password: hashPassword,
    });
    return {
      _id: user._id,
    };
  }

  async findAllNoPagination() {
    const results = await this.userModel.find().select('-password');

    return results;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) {
      current = 1;
    }
    if (!pageSize) {
      pageSize = 10;
    }

    const totalItem = (await this.userModel.find(filter)).length;
    const totalPage = Math.ceil(totalItem / pageSize);
    let skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);
    return { results, totalPage };
  }

  async findAllAccountWithStatus(status: string) {
    let users = [];
    try {
      users = await this.userModel.find({ status }).select('-password');
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }

    return users;
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { fullname, email, password } = registerDto;

    //check mail
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email ${email} is exits. Please try again`,
      );
    }

    //hashPassword
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      fullname,
      email,
      password: hashPassword,
    });

    //generate random code
    const randomCode = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 9),
    ).join('');

    //save code to cache
    await this.cache.set(`otp_${user._id}`, randomCode, 300);

    //send mail
    this.mailerService.sendMail({
      to: email,
      from: '',
      subject: 'Active your account',
      template: 'send-otp',
      context: {
        name: user?.fullname ?? user?.email,
        codeOTP: randomCode,
      },
    });

    return {
      _id: user._id,
      email: user.email,
      message: 'Register success. Please check your email',
    };
  }

  async checkActiveCode(userId: string): Promise<string> {
    const code = await this.cache.get<string>(`active_${userId}`);
    if (!code) {
      throw new NotFoundException(
        `Activation code not found for user ${userId}`,
      );
    }
    return code;
  }

  async sendCodeOTP(email: string) {
    const user = await this.userModel.findOne({
      email,
    });
    if (!user) {
      throw new NotFoundException(`User not found with email ${email}`);
    }

    //generate random code
    const randomCode = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 9),
    ).join('');
    //save code to cache
    await this.cache.set(`otp_${user._id}`, randomCode, 300);

    //send mail
    this.mailerService.sendMail({
      to: email,
      from: '',
      subject: 'Send code OTP',
      template: 'send-otp',
      context: {
        name: user?.fullname ?? user?.email,
        codeOTP: randomCode,
      },
    });
    return {
      message: 'Send code success. Please check your email',
    };
  }

  async verifyCode(body: { email: string; code: string }) {
    const user = await this.userModel.findOne({
      email: body.email,
    });
    if (!user) {
      throw new NotFoundException(`User not found with email ${body.email}`);
    }

    const verifyCode = await this.cache.get<string>(`otp_${user._id}`);
    if (!verifyCode) {
      throw new NotFoundException(`Code not found for user ${user._id}`);
    } else if (verifyCode !== body.code) {
      throw new BadRequestException(`Code is incorrect or expired`);
    }

    await this.cache.del(`otp_${user._id}`);
    return {
      message: 'Verify code success',
    };
  }

  async activeAccount(body: { email: string }) {
    const user = await this.userModel.findOne({ email: body.email });
    if (!user) {
      throw new NotFoundException(`User not found with email ${body.email}`);
    }
    await this.userModel.updateOne({ _id: user._id }, { isActive: true });
    return {
      email: user.email,
      message: 'Active account success',
    };
  }

  async resetPassword(data: UpdateAuthDto) {
    const user = await this.userModel.findOne({
      email: data.email,
    });

    if (!user) {
      throw new NotFoundException(`User not found with email ${data.email}`);
    }

    const hashPassword = await hashPasswordHelper(data.password);
    await this.userModel.updateOne(
      { _id: user._id },
      { password: hashPassword },
    );
    return {
      email: user.email,
      message: 'Reset password success',
    };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  //remove user
  async remove(id: string) {
    try {
      if (this.isUserExist(id)) {
        await this.userModel.findByIdAndUpdate(id, { isActive: false });
      }
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }

    return ResponseMessage('Delete successfully');
  }
  //----------------------------------------------------

  async requestBecomeInstructor(userId: string, updateUserDto: UpdateUserDto) {
    const { ...props } = updateUserDto;

    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid ID format');
      }
      const isUserExist = await this.isUserExist(userId);
      if (isUserExist) {
        const res = await this.userModel.findByIdAndUpdate(userId, {
          status: 'pending',
          categoryId: new Types.ObjectId(props.categoryId),
          description: props.description,
        });
        if (!res) {
          throw new BadRequestException(`Cannot update status user`);
        }
      } else {
        throw new BadRequestException(`User not found with id ${userId}`);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(`Error: ${error}`);
      }
    }
  }

  async approveBecomeInstructor(
    userId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid ID format');
      }
      const user = await this.isUserExist(userId);
      if (user) {
        if (user.status === status) {
          throw new BadRequestException(`User has been ${status}`);
        }
        if (status === 'rejected' && !rejectionReason) {
          throw new BadRequestException('Rejection reason is required');
        }
        user.status = status;
        switch (status) {
          case 'approved':
            user.role = 'instructor';
            break;
          case 'rejected':
            user.rejectionReason = rejectionReason;
            break;
          default:
            user.rejectionReason = undefined;
            break;
        }
        await user.save();
      } else {
        throw new BadRequestException('User not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(`Error: ${error}`);
      }
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserSettingDto) {
    const { ...props } = updateUserDto;
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid ID format');
      }
      const user = await this.isUserExist(userId);
      if (user) {
        if (props.fullname) {
          user.fullname = props.fullname;
        }
        if (props.categoryId) {
          user.categoryId = new Types.ObjectId(props.categoryId);
        }
        if (props.description) {
          user.description = props.description;
        }
        if (props.image) {
          user.image = props.image;
        }
        if (props.facebook) {
          user.facebook = props.facebook;
        }
        if (props.twitter) {
          user.twitter = props.twitter;
        }
        if (props.linkedin) {
          user.linkedin = props.linkedin;
        }
        if (props.youtube) {
          user.youtube = props.youtube;
        }
        await user.save();
      } else {
        throw new BadRequestException('User not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(`Error: ${error}`);
      }
    }
  }

  async countActiveUsers(): Promise<number> {
    return this.userModel.countDocuments({ isActive: true }).exec();
  }

  // --------------------------Subscribe Channels-------------------------

  async subscribeToChannel(
    userId: Types.ObjectId,
    instructorId: Types.ObjectId,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const instructor = await this.userModel.findById(instructorId);
    if (!instructor) {
      throw new NotFoundException(
        `Instructor with ID ${instructorId} not found.`,
      );
    }

    if (userId.toString() === instructorId.toString()) {
      throw new BadRequestException('User cannot subscribe to themselves.');
    }

    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { subscribeChannels: instructorId } },
      { new: true },
    );

    await this.userModel.findByIdAndUpdate(
      instructorId,
      { $inc: { subscribe: 1 } },
      { new: true },
    );

    return { message: 'Subscribe Successfully' };
  }

  async unsubscribeFromChannel(
    userId: Types.ObjectId,
    instructorId: Types.ObjectId,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const instructor = await this.userModel.findById(instructorId);
    if (!instructor) {
      throw new NotFoundException(
        `Instructor with ID ${instructorId} not found.`,
      );
    }

    const isSubscribed = user.subscribeChannels.includes(instructorId);
    if (!isSubscribed) {
      throw new BadRequestException(
        'User is not subscribed to this instructor.',
      );
    }

    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { subscribeChannels: instructorId } },
      { new: true },
    );

    await this.userModel.findByIdAndUpdate(
      instructorId,
      { $inc: { subscribe: -1 } },
      { new: true },
    );

    return { message: 'Unsubscribe Successfully' };
  }

  async getSubscribedInstructors(userId: Types.ObjectId) {
    const user = await this.userModel
      .findById(userId)
      .populate('subscribeChannels', 'fullname email role image')
      .select('subscribeChannels');

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user.subscribeChannels;
  }

  async isInstructorSubscribed(
    userId: Types.ObjectId,
    instructorId: Types.ObjectId,
  ): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('subscribeChannels');
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return user.subscribeChannels.includes(instructorId);
  }

  // --------------------------Likes / Dislikes -------------------------

  async likeCourse(userId: Types.ObjectId, courseId: Types.ObjectId) {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { likedCourses: courseId } },
      { new: true },
    );
  }
  async removelikeCourseItem(userId: Types.ObjectId, courseId: Types.ObjectId) {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { likedCourses: courseId } },
      { new: true },
    );
  }
  async dislikeCourse(userId: Types.ObjectId, courseId: Types.ObjectId) {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { dislikedCourses: courseId } },
      { new: true },
    );
  }
  async removeDislikeCourseitem(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ) {
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { dislikedCourses: courseId } },
      { new: true },
    );
  }

  async getLikedCourses(userId: Types.ObjectId) {
    const user = await this.userModel
      .findById(userId)
      .populate('likedCourses', 'title image totalView')
      .select('likedCourses');

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user.likedCourses;
  }
  async changePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = updatePasswordDto;

    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }


    const isPasswordCorrect = await comparePasswordHelper(currentPassword, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }


    const hashedNewPassword = await hashPasswordHelper(newPassword);

    user.password = hashedNewPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}
