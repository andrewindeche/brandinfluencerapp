import { IsString } from 'class-validator';

export class PromoteUserDto {
  @IsString()
  superUserId: string;

  @IsString()
  userId: string;
}
