import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LectureService } from '../services/lecture.service';
import { CreateLectureDto } from '../dto/create-lecture.dto';
import { UpdateLectureDto } from '../dto/update-lecture.dto';
import { ResponseMessage } from 'src/decorator/custom';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) { }

  @Get('id=:id')
  findOne(@Param('id') id: string) {
    return this.lectureService.findOne(id);
  }

  @Post('create')
  @ResponseMessage('Lecture created successfully')
  create(@Body() createLectureDto: CreateLectureDto) {
    return this.lectureService.create(createLectureDto);
  }

  @Post('/update/:id')
  @ResponseMessage('Lecture updated successfully')
  update(@Param('id') id: string, @Body() updateLectureDto: UpdateLectureDto) {
    return this.lectureService.update(id, updateLectureDto);
  }

  @Post('/update-status/:id')
  @ResponseMessage('Lecture status updated successfully')
  updateStatus(@Param('id') id: string) {
    return this.lectureService.updateStatus(id);
  }

  @Post('/delete/:id')
  @ResponseMessage('Lecture deleted successfully')
  remove(@Param('id') id: string) {
    return this.lectureService.remove(id);
  }

  @Get('/:sectionId')
  findAllLectureBySectionId(@Param('sectionId') sectionId: string) {
    return this.lectureService.findAllLectureBySectionId(sectionId);
  }
}
