import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';


@Schema({ timestamps: true })
export class Progress {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop()
    course: CourseProgress[];
}

class CourseProgress {
    @Prop({ type: Types.ObjectId, ref: 'Course' })
    courseId: Types.ObjectId;

    @Prop({ default: 'not-learn' })
    status: string;

    @Prop({ default: 0 })
    progress: number;

    @Prop()
    sections: SectionProgress[];
}

class SectionProgress {
    @Prop({ type: Types.ObjectId, ref: 'Section' })
    sectionId: Types.ObjectId;

    @Prop({ default: 'not-learn' })
    status: string;

    @Prop({ default: 0 })
    progress: number;

    @Prop()
    lectures: LectureProgress[];

    @Prop()
    quizzes: QuizProgress[];

    @Prop()
    assignments: AssignmentProgress[];
}

class LectureProgress {
    @Prop({ type: Types.ObjectId, ref: 'Lecture' })
    lectureId: Types.ObjectId;

    @Prop({ default: 'not-learn' })
    status: string;
}

class QuizProgress {
    @Prop({ type: Types.ObjectId, ref: 'Quiz' })
    quizId: Types.ObjectId;

    @Prop({ default: 'not-learn' })
    status: string;

    @Prop({ default: 0 })
    score: number;
}

class AssignmentProgress {
    @Prop({ type: Types.ObjectId, ref: 'Assignment' })
    assignmentId: Types.ObjectId;

    @Prop({ default: 'not-learn' })
    status: string;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);