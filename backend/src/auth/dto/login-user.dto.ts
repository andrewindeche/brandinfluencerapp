import { 
  IsNotEmpty, 
  IsString, 
  Matches, 
  MinLength, 
  IsEmail, 
  IsNotIn 
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsMatchingCredentials } from '../is-matching-credentials.decorator';
export class LoginUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value.trim())
  @Matches(/^[a-zA-Z0-9@._-]+$/, { message: 'Invalid characters in email' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, { 
    message: 'Password must contain at least one uppercase letter and one number' 
  })
  @IsNotIn(['password', '123456', 'qwerty'], { message: 'Password is too common' })
  password: string;

  @IsMatchingCredentials({ message: 'Username and password must not match!' })
  credentials: any;
}