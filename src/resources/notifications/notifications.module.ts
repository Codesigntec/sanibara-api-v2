import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, TraceService, PrismaService]
})
export class NotificationModule { }
