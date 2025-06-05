import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
  ValidateIf,
  IsNotIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Match } from '../register.decorator';
import { IsMatchingCredentials } from '../is-matching-credentials.decorator';
export class CreateUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must be at most 20 characters long' })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username can only contain letters, numbers, dots, underscores, and hyphens',
  })
  username: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  @Transform(({ value }) => value.trim())
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @IsNotIn(['password', '123456', 'qwerty'], {
    message: 'Password is too common',
  })
  password: string;

  @ValidateIf((o) => o.password)
  @IsNotEmpty({ message: 'Confirmation password is required' })
  @Match('password', {
    message: 'Confirmation password must match the password',
  })
  confirmPassword: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsString({ message: 'Role must be a string' })
  @IsIn(['brand', 'influencer', 'admin', 'superuser'], {
    message:
      'Role must be one of the following: brand, influencer, admin, superuser',
  })
  role: 'influencer' | 'brand' | 'admin' | 'superuser';

  @IsMatchingCredentials({ message: 'Username and password must not match!' })
  credentials: any;
}
