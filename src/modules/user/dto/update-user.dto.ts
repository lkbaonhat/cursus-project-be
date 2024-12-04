import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
export class UpdateUserDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  categoryId: string;

  @IsOptional()
  description: string;
}

export class UpdateUserSettingDto {
  @IsOptional()
  @IsNotEmpty()
  fullname: string;

  @IsOptional()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  image: string;

  @IsOptional()
  categoryId: string;

  @IsOptional()
  facebook: string;

  @IsOptional()
  twitter: string;

  @IsOptional()
  linkedin: string;

  @IsOptional()
  youtube: string;
}


export class UpdateDeleteUserDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

