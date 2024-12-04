import { Body, Controller, Post } from '@nestjs/common';
import { CertificateService } from '../services/certificate.service';
import { CreateCertificateDto } from '../dto/create-certificate.dto';

@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('/create')
  createCertificate(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificateService.createCertificate(createCertificateDto);
  }
}
