import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum ClientType {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA',
}

export class CreateClientDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsString()
  @Length(11, 18)
  document!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(ClientType)
  type!: ClientType;

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
