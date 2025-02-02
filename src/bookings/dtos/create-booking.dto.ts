import { IsNumber, IsString, IsOptional, IsDateString, IsNotEmpty, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsDateString({}, { message: 'startTime must be a valid ISO 8601 date string' })
  startTime: string;

  @IsDateString({}, { message: 'endTime must be a valid ISO 8601 date string' })
  endTime: string;

  @IsInt({ message: 'resourceId must be a valid integer' })
  @Min(1, { message: 'resourceId must be greater than 0' })
  resourceId: number;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;

}