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
      if (error.code === '23505') {
        throw new ConflictException('Cliente já cadastrado');
      }
      throw error;
    }
  }

  findAll() {
    return this.repo.find();
  }

  async update(id: number, dto: CreateClientDto) {
    const client = await this.repo.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    Object.assign(client, dto);
    return this.repo.save(client);
  }

  async remove(id: number) {
    const client = await this.repo.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return this.repo.remove(client);
  }

}

