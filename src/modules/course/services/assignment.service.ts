import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Assignment } from '../entities/assignment.entity';
import { Model, Types } from 'mongoose';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { SlugService } from 'src/utils/slug.service';
import { UpdateAssignmentDto } from '../dto/update-assignments.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    private slugService: SlugService,
  ) {}

  async isAssignmentExist(assignmentId: string) {
    try {
      const assignment = await this.assignmentModel.findById(assignmentId);
      return assignment ? true : false;
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(createAssignmentDto: CreateAssignmentDto) {
    const { ...payload } = createAssignmentDto;

    const assignment = await this.assignmentModel.create({
      ...payload,
      sectionId: new Types.ObjectId(payload.sectionId),
      slug: this.slugService.createSlug(payload.title),
    });

    return {
      assignmentId: assignment._id,
    };
  }

  async findAllAssignmentBySectionId(sectionId: string) {
    const assignment = await this.assignmentModel.find({
      sectionId: new Types.ObjectId(sectionId),
      isDeleted: false,
    });

    if (!assignment) {
      throw new BadRequestException('Assignment is empty');
    }

    return assignment;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
    try {
      const { ...payload } = updateAssignmentDto;
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid assignment id');
      }
      const assignmentExists = await this.isAssignmentExist(id);
      if (assignmentExists) {
        const assignment = await this.assignmentModel.findByIdAndUpdate(id, {
          ...payload,
          slug: this.slugService.createSlug(payload.title),
        });
        if (!assignment) {
          throw new BadRequestException('Assignment cannot be updated');
        }
      } else {
        throw new BadRequestException('Assignment not found');
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
    const assignment = await this.assignmentModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }
  }
}
