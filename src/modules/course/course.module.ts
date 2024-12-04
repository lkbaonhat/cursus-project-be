import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
//entity
import { CourseSchema } from './entities/course.entity';
import { SubCategorySchema } from '../category/entities/sub-category.entity';
import { SectionSchema } from './entities/section.entity';
import { LectureSchema } from './entities/lecture.entity';
import { QuizSchema } from './entities/quiz.entity';
import { AssignmentSchema } from './entities/assignment.entity';
import { QuizResultSchema } from './entities/quizResult.entity';
//service
import { CourseService } from './services/course.service';
import { SectionService } from './services/section.service';
import { LectureService } from './services/lecture.service';
import { QuizService } from './services/quiz.service';
import { SlugService } from 'src/utils/slug.service';
import { AssignmentService } from './services/assignment.service';
import { UserService } from '../user/user.service';
//controller
import { SectionController } from './controller/section.controller';
import { CourseController } from './controller/course.controller';
import { LectureController } from './controller/lecture.controller';
import { QuizController } from './controller/quiz.controller';
import { AssignmentController } from './controller/assignment.controller';
import { UserSchema } from '../user/entities/user.entity';
import { CertificateSchema } from './entities/certificate.entity';
import { CertificateController } from './controller/certificate.controller';
import { CertificateService } from './services/certificate.service';
import { PurchasedSchema } from '../order/entities/purchased.entity';
import { PurchasedService } from '../order/services/purchased.service';
import { ProgressSchema } from './entities/progress.entity';
import { ProgressController } from './controller/progress.controller';
import { ProgressService } from './services/progess.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      {
        name: 'Course',
        schema: CourseSchema,
      },
      {
        name: 'SubCategory',
        schema: SubCategorySchema,
      },
      {
        name: 'Section',
        schema: SectionSchema,
      },
      {
        name: 'Lecture',
        schema: LectureSchema,
      },
      {
        name: 'Quiz',
        schema: QuizSchema,
      },
      {
        name: 'Assignment',
        schema: AssignmentSchema,
      },
      {
        name: 'QuizResult',
        schema: QuizResultSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'Certificate',
        schema: CertificateSchema,
      },
      {
        name: 'Purchased',
        schema: PurchasedSchema,
      },
      {
        name: 'Progress',
        schema: ProgressSchema,
      },
    ]),
  ],
  controllers: [
    CourseController,
    SectionController,
    LectureController,
    QuizController,
    AssignmentController,
    CertificateController,
    ProgressController,
  ],
  providers: [
    CourseService,
    SectionService,
    LectureService,
    QuizService,
    SlugService,
    AssignmentService,
    UserService,
    CertificateService,
    PurchasedService,
    ProgressService,
  ],
  exports: [
    SectionService,
    LectureService,
    QuizService,
    AssignmentService,
    ProgressService,
    MongooseModule,
  ],
})
export class CourseModule { }
