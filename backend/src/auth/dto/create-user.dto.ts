import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(['brand', 'influencer', 'admin', 'superuser'], {
    message: 'Invalid role',
  })
  role: 'influencer' | 'brand' | 'admin' | 'superuser';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
