import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

class UploadedFiles {
  id: number;
  name: string;
  url: string;
}

export class CreateAssignmentDto {
  @IsNotEmpty({ message: 'Section ID is required' })
  sectionId: Types.ObjectId;
  @IsNotEmpty({ message: 'Title is required' })
  title: string;
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
  @IsNotEmpty({ message: 'Time duration is required' })
  timeDuration: number;
  @IsNotEmpty({ message: 'Total number is required' })
  totalNumber: number;
  @IsNotEmpty({ message: 'Minimum pass number is required' })
  minPassNumber: number;
  @IsNotEmpty({ message: 'Upload limit is required' })
  uploadLimit: number;
  @IsNotEmpty({ message: 'Maximum attachment size is required' })
  maxAttachmentSize: number;
  @IsOptional()
  uploadedFiles: UploadedFiles[];
}
