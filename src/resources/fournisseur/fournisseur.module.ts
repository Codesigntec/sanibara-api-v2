import { Module } from '@nestjs/common';
import { FournisseurController } from './fournisseur.controller'
import { FournisseurService } from './fournisseur.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [FournisseurController],
  providers: [FournisseurService, TraceService, PrismaService]
})
export class FournisseurModule { }
