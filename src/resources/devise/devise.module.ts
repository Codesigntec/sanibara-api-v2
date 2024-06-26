import { Module } from '@nestjs/common';
import { DeviseController } from './devise.controller'
import { DeviseService } from './devise.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [DeviseController],
  providers: [DeviseService, TraceService, PrismaService]
})
export class DeviseModule { }
