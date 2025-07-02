import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum ClientType {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA',
}

export class CreateClientDto {
  @IsEnum(ClientType)
  type!: ClientType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // NOVOS CAMPOS
  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  suframa?: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
