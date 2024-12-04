import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSectionDto } from '../dto/create-section.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Section } from '../entities/section.entity';
import { Model, Types } from 'mongoose';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { LectureService } from './lecture.service';
import { QuizService } from './quiz.service';
import { AssignmentService } from './assignment.service';
import { SlugService } from 'src/utils/slug.service';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    private readonly lectureService: LectureService,
    private readonly quizService: QuizService,
    private readonly assignmentService: AssignmentService,
    private readonly slugService: SlugService,
  ) {}

  async isSectionExist(sectionId: string) {
    try {
      const section = await this.sectionModel.findById(sectionId);
      return section ? true : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async create({ ...createSectionDto }: CreateSectionDto) {
    const { ...payload } = createSectionDto;

    const section = await this.sectionModel.create({
      ...payload,
      courseId: new Types.ObjectId(payload.courseId),
      slug: this.slugService.createSlug(payload.name),
    });
    if (!section) {
      throw new BadRequestException('Section can not created');
    }
    await section.save();

    return {
      sectionId: section._id,
    };
  }

  async findAllSectionByCourseId(courseId: string) {
    let sectionsInfo = [];
    const sections = await this.sectionModel.find({
      courseId: new Types.ObjectId(courseId),
      isDeleted: false,
    });
    if (!sections) {
      throw new BadRequestException('Section is empty');
    }

    for (const sec of sections) {
      const sectionData = sec.toJSON();
      let quiz = [],
        lecture = [],
        assignment = [];
      try {
        // Concurrently fetch related data for quizzes, lectures, and assignments
        [quiz, lecture, assignment] = await Promise.all([
          this.quizService.findAllQuizBySectionId(sec._id.toString()),
          this.lectureService.findAllLectureBySectionId(sec._id.toString()),
          this.assignmentService.findAllAssignmentBySectionId(
            sec._id.toString(),
          ),
        ]);
      } catch (error) {
      } finally {
        // Combine section data with related lists
        sectionsInfo.push({
          ...sectionData,
          listQuiz: quiz,
          listLecture: lecture,
          listAssignment: assignment,
        });
      }
    }

    return sectionsInfo;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    try {
      const { name } = updateSectionDto;
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid section ID format');
      }
      const sectionExists = await this.isSectionExist(id);
      if (sectionExists) {
        const section = await this.sectionModel.findByIdAndUpdate(id, {
          name,
          slug: this.slugService.createSlug(name),
        });
        if (!section) {
          throw new BadRequestException('Cannot update section');
        }
      } else {
        throw new BadRequestException('Section not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }

  async remove(id: string) {
    const section = await this.sectionModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    if (!section) {
      throw new BadRequestException(`Section ${id} not found`);
    }
    section.save();
  }
}
