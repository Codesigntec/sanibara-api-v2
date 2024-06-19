import { Module } from '@nestjs/common';
import { MagasinController } from './magasin.controller'
import { MagasinService } from './magasin.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [MagasinController],
  providers: [MagasinService, TraceService, PrismaService]
})
export class MagasinMatierePremiereModule { }
