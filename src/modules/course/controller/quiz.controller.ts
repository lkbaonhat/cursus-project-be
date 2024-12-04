import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { ResponseMessage } from 'src/decorator/custom';
import { SaveQuizResultDto } from '../dto/save-quiz-result.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post('/create')
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Post('/save-result')
  @ResponseMessage('Save quiz result successfully')
  saveResult(@Body() saveResultQuizDto: SaveQuizResultDto) {
    return this.quizService.saveResult(saveResultQuizDto);
  }

  @Post('/update/:id')
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Get('/:sectionId')
  findAllQuizBySectionId(@Param('sectionId') sectionId: string) {
    return this.quizService.findAllQuizBySectionId(sectionId);
  }

  @Get('/quiz-results/userId=:userId&quizId=:quizId')
  findQuizResultsByUserIdAndQuizId(@Param('userId') userId: string, @Param('quizId') quizId: string) {
    return this.quizService.findQuizResultsByUserIdAndQuizId(userId, quizId);
  }

  @Get('/quiz-results/userId=:userId&courseId=:courseId')
  @ResponseMessage('Get quiz results successfully')
  findQuizResultsByUserIdAndCourseId(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.quizService.findQuizResultsByUserIdAndCourseId(userId, courseId);
  }

  @Get('/list-question/:quizId')
  @ResponseMessage('Get list question by quiz id successfully')
  getAllInfoQuizByQuizId(@Param('quizId') quizId: string) {
    return this.quizService.getAllInfoQuizByQuizId(quizId);
  }
}
