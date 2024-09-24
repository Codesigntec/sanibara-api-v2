import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';
import { VentesService } from './vente.service';
import { VentesController } from './vente.controller';
import { PaiementVenteController } from './paiementvente.controller';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [VentesController, PaiementVenteController],
  providers: [VentesService, TraceService, PrismaService]
})
export class VenteModule { }
//sdlkskjododsdlcssbsc