import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';
import { AchatController } from './achat.controller';
import { AchatService } from './achat.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [AchatController],
  providers: [AchatService, TraceService, PrismaService]
})
export class AchatsModule { }