import { Module } from '@nestjs/common';
import { ResultatsController } from './resultats.controller'
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';
import { ResultatsService } from './resultats.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ResultatsController],
  providers: [ResultatsService, TraceService, PrismaService]
})
export class ResultatsModule { }
