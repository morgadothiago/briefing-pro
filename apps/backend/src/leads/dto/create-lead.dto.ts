import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  clientName!: string

  @IsEmail()
  @IsOptional()
  clientEmail?: string

  @IsString()
  @IsOptional()
  clientPhone?: string

  @IsString()
  @IsOptional()
  clientCompany?: string

  @IsString()
  @IsNotEmpty()
  projectName!: string

  @IsString()
  @IsOptional()
  projectType?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  estimatedValue?: number
}

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  clientName?: string

  @IsEmail()
  @IsOptional()
  clientEmail?: string

  @IsString()
  @IsOptional()
  clientPhone?: string

  @IsString()
  @IsOptional()
  clientCompany?: string

  @IsString()
  @IsOptional()
  projectName?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  estimatedValue?: number

  @IsString()
  @IsOptional()
  notes?: string

  @IsString()
  @IsOptional()
  meetingDate?: string

  @IsString()
  @IsOptional()
  meetingLink?: string

  @IsString()
  @IsOptional()
  meetingNotes?: string
}

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: string
}

export class UpdateKanbanDto {
  @IsNumber()
  column!: number
}
