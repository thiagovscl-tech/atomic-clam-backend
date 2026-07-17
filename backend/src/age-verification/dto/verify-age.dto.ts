import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class VerifyAgeDto {
  @IsInt() @Min(1) @Max(31)
  day: number;

  @IsInt() @Min(1) @Max(12)
  month: number;

  @IsInt() @Min(1900)
  year: number;

  @IsOptional() @IsString()
  countryCode?: string;

  @IsOptional() @IsString()
  region?: string;
}
