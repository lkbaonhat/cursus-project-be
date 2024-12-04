import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Certificate } from 'crypto';

@Injectable()
export class CertificateService {
  constructor(
    @InjectModel(Certificate.name) private certificateModel: Model<Certificate>,
  ) {}

  createCertificate(createCertificateDto: CreateCertificateDto) {
    const { ...payload } = createCertificateDto;
    try {
      if (!Types.ObjectId.isValid(payload.subCategoryId)) {
        throw new BadRequestException('Invalid subCategoryId format');
      }
      const certificate = this.certificateModel.create({
        ...payload,
        subCategoryId: new Types.ObjectId(payload.subCategoryId),
      });
      if (!certificate) {
        throw new BadRequestException('Certificate not created');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error(error);
      }
    }
  }
}
