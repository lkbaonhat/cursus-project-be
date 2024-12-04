import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { ResponseMessage } from 'src/decorator/custom';
import { UpdateAssignmentDto } from '../dto/update-assignments.dto';

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get('/section/:id')
  findAllAssignmentBySectionId(@Param('id') id: string) {
    return this.assignmentService.findAllAssignmentBySectionId(id);
  }

  @Post('/create')
  @ResponseMessage('Assignment created successfully')
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentService.create(createAssignmentDto);
  }

  @Post('/update/:id')
  @ResponseMessage('Assignment updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentService.update(id, updateAssignmentDto);
  }

  @Post('/delete/:id')
  @ResponseMessage('Assignment deleted successfully')
  remove(@Param('id') id: string) {
    return this.assignmentService.remove(id);
  }
}
