import { Module } from '@nestjs/common';
import { ClientController } from './client.controller'
import { ClientService } from './client.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ClientController],
  providers: [ClientService, TraceService, PrismaService]
})
export class ClientModule { }
