import { Controller, Post, Body, Get, Param, Put, Delete, NotFoundException  } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // NOVO: buscar cliente por ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cliente = await this.service.findById(Number(id));
    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    return cliente;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateClientDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }


}
