import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class CreateProgressDto {
    @IsNotEmpty({ message: 'UserId is required' })
    userId: Types.ObjectId;

    @IsArray()
    @Type(() => CourseProgressDto)
    @IsOptional()
    course: CourseProgressDto[];
}

class CourseProgressDto {
    @IsNotEmpty({ message: 'CourseId is required' })
    courseId: Types.ObjectId;

    @IsOptional()
    status: string;

    @IsOptional()
    progress: number;

    @IsArray()
    @IsOptional()
    @Type(() => SectionProgressDto)
    sections: SectionProgressDto[];
}

class SectionProgressDto {
    @IsNotEmpty({ message: 'SectionId is required' })
    sectionId: Types.ObjectId;

    @IsOptional()
    status: string;

    @IsOptional()
    progress: number;

    @IsArray()
    @IsOptional()
    @Type(() => LectureProgressDto)
    lectures: LectureProgressDto[];

    @IsArray()
    @IsOptional()
    @Type(() => QuizProgressDto)
    quizzes: QuizProgressDto[];

    @IsArray()
    @IsOptional()
    @Type(() => AssignmentProgressDto)
    assignments: AssignmentProgressDto[];
}

class LectureProgressDto {
    @IsNotEmpty({ message: 'LectureId is required' })
    lectureId: Types.ObjectId;

    @IsOptional()
    status: string;
}

class QuizProgressDto {
    @IsNotEmpty({ message: 'QuizId is required' })
    quizId: Types.ObjectId;

    @IsOptional()
    status: string;

    @IsOptional()
    score: number;
}

class AssignmentProgressDto {
    @IsNotEmpty({ message: 'AssignmentId is required' })
    assignmentId: Types.ObjectId;

    @IsOptional()
    status: string;
}
