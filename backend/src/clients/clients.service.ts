import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { ConflictException } from '@nestjs/common'; // no topo do arquivo

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private repo: Repository<Client>,
  ) { }



  async create(dto: CreateClientDto) {
    try {
      const client = this.repo.create(dto);
      return await this.repo.save(client);
    } catch (error: any) {
      // 23505 é o código do PostgreSQL para violação de UNIQUE
      if (error.code === '23505') {
        throw new ConflictException('Documento já cadastrado');
      }
      throw error;
    }
  }

  findAll() {
    return this.repo.find();
  }

  // NOVO: buscar cliente por ID
  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

 async update(id: number, dto: CreateClientDto) {
  const client = await this.repo.findOne({ where: { id } });
  if (!client) throw new NotFoundException('Cliente não encontrado');
  Object.assign(client, dto);
  try {
    return await this.repo.save(client);
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ConflictException('Documento já cadastrado');
    }
    throw error;
  }
}

  async remove(id: number) {
    const client = await this.repo.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return this.repo.remove(client);
  }

}

