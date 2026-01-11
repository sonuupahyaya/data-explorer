import { IsString, IsOptional, IsDate } from 'class-validator';

export class CreateViewHistoryDto {
  @IsString()
  product_id: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  user_agent?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  referrer?: string;
}
