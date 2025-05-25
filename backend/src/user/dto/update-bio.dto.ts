import { IsString } from 'class-validator';

export class UpdateBioDto {
  @IsString()
  bio: string;
}
