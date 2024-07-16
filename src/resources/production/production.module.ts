import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ProductionController],
  providers: [ ProductionService, TraceService, PrismaService]
})
export class ProductionModule { }
