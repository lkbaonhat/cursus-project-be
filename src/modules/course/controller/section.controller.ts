import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SectionService } from '../services/section.service';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { ResponseMessage } from 'src/decorator/custom';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post('/create')
  @ResponseMessage('Create section successfully')
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(createSectionDto);
  }

  @Post('/update/:id')
  @ResponseMessage('Update section successfully')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionService.update(id, updateSectionDto);
  }

  @Post('/delete/:id')
  @ResponseMessage('Delete section successfully')
  remove(@Param('id') id: string) {
    return this.sectionService.remove(id);
  }

  @Get('/:courseId')
  @ResponseMessage('Find all section by course id successfully')
  findAllSectionByCourseId(@Param('courseId') courseId: string) {
    return this.sectionService.findAllSectionByCourseId(courseId);
  }
}
