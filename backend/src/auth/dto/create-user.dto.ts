import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Match } from '../register.decorator';

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
