import { Module } from '@nestjs/common';
import {UtilisateurController} from './utilisateur.controller'
import { UtilisateurService } from './utilisateur.service';
import { DatabaseModule } from 'src/database/database.module';
import { TraceService } from '../trace/trace.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    imports: [
        DatabaseModule,
      ],
    controllers: [UtilisateurController],
    providers: [UtilisateurService, TraceService, PrismaService]
})
export class UtilisateurModule {}
