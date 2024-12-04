import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  userId: string;
  @IsOptional()
  courseId: string;
  @IsOptional()
  sectionId: string;
  @IsOptional()
  lectureId: string;
  @IsOptional()
  quizId: string;
  @IsOptional()
  assignmentId: string;
}

export class CertificateDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  courseId: string;
}
