import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MagasinFetcher, MagasinSaver, Magasin, MagasinSelect } from '../magasin.types';
import { errors } from '../magasin.constant';
import { TraceService } from '../../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class MagasinService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: MagasinFetcher, query: PaginationQuery, userId: string): Promise<Pagination<Magasin>> => {

            const utilisateur = await this.db.utilisateur.findUnique({
                where: { id: userId},
                select: {
                        role: {
                            select: {
                                id: true,
                                libelle: true
                            }
                        },
                    accesMagasinsMatierePremieres: {
                        select: {
                            magasin: {
                                select: {
                                    id: true,
                                    nom: true
                                }
                            },
                        }
                    }
                }
            })

        if (!utilisateur) {
            throw new HttpException(errors.USER_NOT_EXIST, HttpStatus.BAD_REQUEST);
        }
        
        const magasinIdsMatierePremieres = utilisateur.accesMagasinsMatierePremieres.map(access => access.magasin.id);

        if (magasinIdsMatierePremieres.length === 0 && utilisateur.role.libelle !== 'Administrateur') {
            return {
                data: [],
                totalPages: 0,
                totalCount: 0,
                currentPage: query.page ? query.page : 1,
                size: query.size ? query.size : 10,
            };
        }
        
        const conditions = {
            ...filter,
            id: { in: magasinIdsMatierePremieres.length ? magasinIdsMatierePremieres : undefined }
        };

        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if(query.orderBy){
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const magasins = await this.db.magasinMatierePremiere.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: { id: true, numero: true, nom: true, adresse: true, createdAt: true, },
            orderBy: order
        })

        const totalCount = await this.db.magasinMatierePremiere.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Magasin> = {
            data: magasins,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<MagasinSelect[]> => {
        const magasins = await this.db.magasinMatierePremiere.findMany({
            where: { removed: false, archive: false },
            select: { id: true, nom: true }
        })
        return magasins
    }

    save = async (data: MagasinSaver, userId: string): Promise<Magasin> => {
        const check = await this.db.magasinMatierePremiere.findFirst({
            where: {
                nom: {
                    equals: data.nom,
                    mode: 'insensitive'
                }
            }
        })
        if (check !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const magasin = await this.db.magasinMatierePremiere.create({
            data: {
                nom: data.nom,
                adresse: data.adresse,
            },
            select: { id: true, numero: true, nom: true, adresse: true, createdAt: true }
        })

        const description = `Ajout de magasin des matieres premieres: ${data.nom}`
        this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return magasin
    }

    update = async (id: string, data: MagasinSaver, userId: string): Promise<Magasin> => {
        const check = await this.db.magasinMatierePremiere.findUnique({ where: { id: id }, select: { nom: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const checkFirst = await this.db.magasinMatierePremiere.findFirst({
            where: {
                id: {
                    not: id
                },
                nom: {
                    equals: data.nom,
                    mode: 'insensitive'
                }
            }
        })
        if (checkFirst !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const magasin = await this.db.magasinMatierePremiere.update({
            where: { id },
            data: {
                nom: data.nom,
                adresse: data.adresse,
            },
            select: { id: true, numero: true, nom: true, adresse: true, createdAt: true }
        })

        const description = `Modification du magasin des matieres premieres: ${check.nom} -> ${data.nom}`
        this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return magasin
    }

    archive = async (id: string, userId: string): Promise<Magasin> => {
        const check = await this.db.magasinMatierePremiere.findUnique({ where: { id: id }, select: { nom: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const magasin = await this.db.magasinMatierePremiere.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: { id: true, numero: true, nom: true, adresse: true, createdAt: true }
        })

        const description = `Archivage du magasin des matieres premieres: ${check.nom}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return magasin
    }

    remove = async (id: string, userId: string): Promise<Magasin> => {
        const check = await this.db.magasinMatierePremiere.findUnique({ where: { id: id }, select: { nom: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const magasin = await this.db.magasinMatierePremiere.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: { id: true, numero: true, nom: true, adresse: true, createdAt: true }
        })

        const description = `Suppression logique du magasin des matieres premieres: ${check.nom}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return magasin
    }

    destroy = async (id: string, userId: string): Promise<Magasin> => {
        const check = await this.db.magasinMatierePremiere.findUnique({ where: { id: id }, select: { nom: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const magasin = await this.db.magasinMatierePremiere.delete({
                where: { id },
                select: { id: true, numero: true, nom: true, adresse: true, createdAt: true }
            })

            const description = `Suppression physique du magasin des matieres premieres: ${check.nom}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return magasin
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }



}
