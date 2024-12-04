// dto/update-password.dto.ts
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdatePasswordDto {
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    @MaxLength(20, { message: 'Mật khẩu mới không được vượt quá 20 ký tự' })
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    confirmPassword: string;
}
