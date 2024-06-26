import { Module } from '@nestjs/common';
import { TraceService } from './trace.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceController } from './trace.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [TraceController],
  providers: [TraceService, PrismaService]
})
export class TraceModule {}
