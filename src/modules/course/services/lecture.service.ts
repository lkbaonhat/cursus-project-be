import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLectureDto } from '../dto/create-lecture.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lecture } from '../entities/lecture.entity';
import { Model, Types } from 'mongoose';
import { UpdateLectureDto } from '../dto/update-lecture.dto';
import { SlugService } from 'src/utils/slug.service';

@Injectable()
export class LectureService {
  constructor(
    @InjectModel(Lecture.name) private lectureModel: Model<Lecture>,
    private slugService: SlugService,
  ) {}

  async isLectureExist(lectureId: string) {
    try {
      const lecture = await this.lectureModel.findById(lectureId);
      return lecture ? true : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(createLectureDto: CreateLectureDto) {
    const { ...payload } = createLectureDto;

    const lecture = await this.lectureModel.create({
      ...payload,
      sectionId: new Types.ObjectId(payload.sectionId),
      slug: this.slugService.createSlug(payload.title),
    });

    if (!lecture) {
      throw new BadRequestException('Lecture can not created');
    }
    return {
      lectureId: lecture._id,
    };
  }

  async findAllLectureBySectionId(sectionId: string) {
    const lectures = await this.lectureModel.find({
      sectionId: new Types.ObjectId(sectionId),
      isDeleted: false,
    });
    if (!lectures) {
      throw new BadRequestException('Lecture is empty');
    }

    return lectures;
  }

  async findOne(id: string) {
    try {
      const lecture = await this.lectureModel.findById(id);
      if (!lecture) {
        throw new BadRequestException(`Id: ${id} not found`);
      }
      return lecture;
    } catch (error) {
      throw new BadRequestException(`Id: ${id} not found`);
    }
  }

  async update(id: string, updateLectureDto: UpdateLectureDto) {
    const { ...payload } = updateLectureDto;
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid lecture id format');
      }
      const lectureExist = await this.isLectureExist(id);
      if (lectureExist) {
        const lecture = await this.lectureModel.findByIdAndUpdate(id, {
          ...payload,
          slug: this.slugService.createSlug(payload.title),
        });
        if (!lecture) {
          throw new BadRequestException('Cannot update lecture');
        }
      } else {
        throw new BadRequestException('Lecture not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async updateStatus(id: string) {
    try {
      const lecture = await this.lectureModel.findByIdAndUpdate(id, {
        status: 'learned',
      });
      if (!lecture) {
        throw new BadRequestException(`Id: ${id} not found`);
      }
    } catch (error) {
      throw new BadRequestException(`Id: ${id} not found`);
    }
  }

  async remove(id: string) {
    const lecture = await this.lectureModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    if (!lecture) {
      throw new BadRequestException(`Id: ${id} not found`);
    }
    lecture.save();
  }
}
