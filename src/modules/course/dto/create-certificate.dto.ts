import { IsNotEmpty } from 'class-validator';

export class CreateCertificateDto {
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;
  @IsNotEmpty({ message: 'Email address is required' })
  emailAdress: string;
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;
  @IsNotEmpty({ message: 'Sub category id is required' })
  subCategoryId: string;
}
