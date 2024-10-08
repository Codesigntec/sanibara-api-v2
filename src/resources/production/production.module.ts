import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';
import { StocksService } from './stock-produit-fini';
import { StockProduiFiniController } from './stock-produit-fini.controller';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [ProductionController, StockProduiFiniController],
  providers: [ ProductionService, StocksService, TraceService, PrismaService]
})
export class ProductionModule {}
