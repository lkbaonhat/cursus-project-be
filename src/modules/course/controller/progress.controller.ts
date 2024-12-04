import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProgressService } from '../services/progess.service';
import { CreateProgressDto } from '../dto/create-progresss.dto';
import { CertificateDto, UpdateProgressDto } from '../dto/update-progress.dto';
import { ResponseMessage } from 'src/decorator/custom';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) { }

  @Post('create-progress')
  async createProgress(@Body() createProgressDto: CreateProgressDto) {
    return this.progressService.createProgress(createProgressDto);
  }

  @Post('update-progress')
  async updateProgress(@Body() updateProgressDto: UpdateProgressDto) {
    return this.progressService.updateProgress(updateProgressDto);
  }


  @Post('certificate')
  @ResponseMessage('Congratulation! You have received a certificate. Check your mail!')
  getCertificate(@Body() certicateDto: CertificateDto) {
    return this.progressService.getCertificate(certicateDto);
  }


  @Get('find-progress-course')
  async findOneCourseProgressByCourseId(@Query('courseId') courseId: string, @Query('userId') userId: string) {
    return this.progressService.findOneCourseProgressByCourseId(courseId, userId);
  }

  @Get('find-progress/:userId')
  async findOneProgressByUserId(@Param('userId') userId: string) {
    return this.progressService.findOneProgressByUserId(userId);
  }
  @Get('completion-rates')
  async getCompletionRates() {
    return this.progressService.calculateCompletionRates();
  }
  @Get('average-progress')
  async getAverageProgress(): Promise<{ averageProgress: number }> {
    return this.progressService.calculateAverageProgress();
  }
}
