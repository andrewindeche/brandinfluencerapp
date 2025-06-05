import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, { 
    message: 'Password must contain at least one uppercase letter and one number' 
  })

  password: string;
}
