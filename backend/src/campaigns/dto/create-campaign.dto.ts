import { IsString, IsArray, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsString()
  instructions: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  images: string[];

  @IsString()
  status?: 'active' | 'inactive';

  @IsString()
  brandId: string;
}
