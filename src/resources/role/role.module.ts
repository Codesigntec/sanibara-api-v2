import { Module } from '@nestjs/common';
import { RoleController } from './role.controller'
import { RoleService } from './role.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [RoleController],
  providers: [RoleService, TraceService, PrismaService]
})
export class RoleModule { }
