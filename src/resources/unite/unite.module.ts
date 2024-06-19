import { Module } from '@nestjs/common';
import {UniteController} from './unite.controller'
import { UniteService } from './unite.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceModule } from '../trace/trace.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    imports: [
        DatabaseModule,
        // TraceModule,
      ],
    controllers: [UniteController],
    providers: [UniteService, TraceService, PrismaService]
})
export class UniteModule {}
