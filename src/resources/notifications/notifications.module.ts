import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, TraceService, PrismaService]
})
export class NotificationModule { }
