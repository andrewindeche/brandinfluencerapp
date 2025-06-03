import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class InfluencerLoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
