import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errors } from './structure.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';
import { Structure, StructureFull } from './structure.types';

@Injectable()
export class StructureService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }



    saveOrUpdate = async (data: Structure, userId: string): Promise<Structure> => {

        const struct = await this.db.structure.findMany({
            select: { id: true,  },
        })
        
        let structure: Structure;
        if (struct.length <= 0) {
         structure = await this.db.structure.create({
            data: {
                nom: data.nom,
                email: data.email,
                telephone: data.telephone,
                adresse: data.adresse,
                logo: data.logo ? data.logo : "",
            },
            select: { id: true, nom: true, email: true, telephone: true, logo: true, adresse: true, createdAt: true, updatedAt: true }
        })
        }else{
              
            structure = await this.db.structure.update({
                where: { id: data.id },
                data: {
                    nom: data.nom,
                    email: data.email,
                    telephone: data.telephone,
                    adresse: data.adresse,
                    logo: data.logo,
                },
                select: { id: true, nom: true, email: true, telephone: true, logo: true, adresse: true, createdAt: true, updatedAt: true }
            })
        }

        const description = `Renseignement des données de la structure: ${data.nom}`
        this.trace.logger({action: 'Ajout', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

        return structure
    }

    list = async (): Promise<Structure[]> => { // Retourne un tableau de Structure
        const structures = await this.db.structure.findMany({
            select: { 
                id: true, 
                nom: true,
                email: true,
                telephone: true,
                adresse: true,
                logo: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return structures as Structure[]; // Assurez-vous que le type correspond
    }
}
