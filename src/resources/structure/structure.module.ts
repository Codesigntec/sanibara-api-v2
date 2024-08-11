import { Module } from '@nestjs/common';
import {StructureController} from './structure.controller'
import { StructureService } from './structure.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceModule } from '../trace/trace.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    imports: [
        DatabaseModule,
        // TraceModule,
      ],
    controllers: [StructureController],
    providers: [StructureService, TraceService, PrismaService]
})
export class StructureModule {}
