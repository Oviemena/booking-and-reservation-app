import { IsEmail, IsString, MinLength, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsEnum(['admin', 'user', 'staff'], { message: 'Invalid role' })
  role: 'admin' | 'user' | 'staff' = 'user';
}