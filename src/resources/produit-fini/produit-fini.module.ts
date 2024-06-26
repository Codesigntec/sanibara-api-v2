import { Module } from '@nestjs/common';
import { ProduitController } from './produit-fini.controller'
import { ProduitService } from './produit-fini.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ProduitController],
  providers: [ProduitService, TraceService, PrismaService]
})
export class ProduitModule { }
