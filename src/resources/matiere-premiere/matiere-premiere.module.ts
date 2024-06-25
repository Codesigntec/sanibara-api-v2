import { Module } from '@nestjs/common';
import { MatiereController } from './matiere-premiere.controller'
import { MatiereService } from './matiere-premiere.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [MatiereController],
  providers: [MatiereService, TraceService, PrismaService]
})
export class MatiereModule { }
