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

        if (struct.length > 0) {
              
         structure = await this.db.structure.create({
            data: {
                nom: data.nom,
                email: data.email,
                telephone: data.telephone,
                adresse: data.adresse,
                logo: data.logo,
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

    // update = async (id: string, data: UniteSaver, userId: string): Promise<Unite> => {
    //     const check = await this.db.unite.findUnique({ where:  {id: id }, select: { libelle: true } })
    //     if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

    //     const checkFirst = await this.db.unite.findFirst({ 
    //         where: { 
    //             id: {
    //                 not: id
    //             },
    //             libelle: { 
    //                 equals: data.libelle,
    //                 mode: 'insensitive'
    //             } 
    //         }
    //     })
    //     if (checkFirst !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

    //     const unite = await this.db.unite.update({
    //         where: { id },
    //         data: {
    //             libelle: data.libelle
    //         },
    //         select: { id: true, libelle: true, createdAt: true }
    //     })

    //     const description = `Modification de l'unité: ${check.libelle} -> ${data.libelle}`
    //     this.trace.logger({action: 'Modification', description, userId }).then(res=>console.log("TRACE SAVED: ", res))


    //     return unite
    // }

    
}
