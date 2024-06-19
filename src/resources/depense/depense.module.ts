import { Module } from '@nestjs/common';
import { DepenseController } from './depense.controller'
import { DepenseService } from './depense.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [DepenseController],
  providers: [DepenseService, TraceService, PrismaService]
})
export class DepenseModule { }
