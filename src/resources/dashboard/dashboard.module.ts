import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller'
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, TraceService, PrismaService]
})
export class DashboardModule { }
