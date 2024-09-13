import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MatiereFetcher, MatiereSaver, Matiere, MatiereSelect, MatiereFull, MatiereFilter } from './matiere-premiere.types';
import { errors } from './matiere-premiere.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class MatiereService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: MatiereFetcher, query: PaginationQuery): Promise<Pagination<Matiere>> => {
        let conditions = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        // Gestion du paramètre de recherche globale 
        if (filter.search) {
            conditions = {
                OR: [
                    { designation: { contains: filter.search, mode: "insensitive" } },
                    { description: { contains: filter.search, mode: "insensitive" } }
                ]
            }
        }
    
        if (filter.designation) {
            conditions = {
                ...conditions, 
                designation: {
                    contains: filter.designation,
                    mode: "insensitive"
                }
            }
        }
        // if (filter.categorieId) { conditions = { ...conditions, categorieId: filter.categorieId } }
        if (filter.uniteId) { conditions = { ...conditions, uniteId: filter.uniteId } }
        // if(filter.paymentMethode){ conditions = { ...conditions, paymentMethode: filter.paymentMethode } }

        if (filter.debut || filter.fin) {
            let dateFilter = {};
            if (filter.debut) {
                dateFilter = { ...dateFilter, gte: new Date(filter.debut) };
            }
            if (filter.fin) {
                dateFilter = { ...dateFilter, lte: new Date(filter.fin) };
            }
            conditions = { ...conditions, createdAt: dateFilter };
        }
        
        conditions = { ...conditions, removed: filter.removed, archive: filter.archive }

        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const matieres = await this.db.matierePremiere.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: {
                id: true,
                numero: true,
                designation: true,
                description: true,
                createdAt: true,
                unite: {
                    select: {
                        id: true,
                        libelle: true,
                        symbole: true
                    }
                }
            },
            orderBy: order
        })

        const totalCount = await this.db.matierePremiere.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Matiere> = {
            data: matieres,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }


    select = async (): Promise<MatiereSelect[]> => {
        const matieres = await this.db.matierePremiere.findMany({
            where: { removed: false, archive: false },
            select: { id: true, designation: true }
        })
        return matieres
    }

    findById = async (id: string): Promise<MatiereFull> => {
        const matiere = await this.db.matierePremiere.findUnique({
            where: { id },
            select: {
                id: true,
                numero: true,
                designation: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                unite: {
                    select: {
                        id: true,
                        libelle: true,
                        symbole: true,
                        createdAt: true
                    }
                }
            }
        })
        if (matiere === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
        return matiere
    }

    save = async (data: MatiereSaver, userId: string): Promise<Matiere> => {
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.matierePremiere.findFirst({
                    where: {
                        designation: {
                            equals: data.designation,
                            mode: 'insensitive'
                        }
                    }
                })
                if (check !== null) throw new HttpException(errors.NAME_ALREADY_EXIST, HttpStatus.BAD_REQUEST);


                const matiere = await tx.matierePremiere.create({
                    data: {
                        designation: data.designation,
                        description: data.description,
                        unite: {
                            connect: { id: data.uniteId }
                        }
                    },
                    select: {
                        id: true,
                        numero: true,
                        designation: true,
                        description: true,
                        createdAt: true,
                        unite: {
                            select: {
                                id: true,
                                libelle: true,
                                symbole: true
                            }
                        }
                    }
                })


                const description = `Ajout de matiere premiere: ${data.designation}`
                this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return matiere
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    filter = async (data: MatiereFilter, filter: MatiereFetcher, query: PaginationQuery): Promise<Pagination<Matiere> > => {
        let conditions = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        // let filters = { }
        // if (data.categorieId) { conditions = { ...conditions, categorieId: data.categorieId } }
        if (data.uniteId) { conditions = { ...conditions, uniteId: data.uniteId } }
        // if(data.paymentMethode){ conditions = { ...conditions, paymentnew Date(data.debut)Methode: data.paymentMethode } }

        if (data.debut || data.fin) {
            let dateFilter = {};
            if (data.debut) {
                dateFilter = { ...dateFilter, gte: new Date(data.debut) };
            }
            if (data.fin) {
                dateFilter = { ...dateFilter, lte: new Date(data.fin) };
            }
            conditions = { ...conditions, date: dateFilter };
        }
        conditions = { ...conditions, ...filter }
        // const conditions = { ...filter,  }
        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const matieres = await this.db.matierePremiere.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: {
                id: true,
                numero: true,
                designation: true,
                description: true,
                createdAt: true,
                unite: {
                    select: {
                        id: true,
                        libelle: true,
                        symbole: true
                    }
                }
            },
            orderBy: order
        })

        const totalCount = await this.db.matierePremiere.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Matiere> = {
            data: matieres,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    update = async (id: string, data: MatiereSaver, userId: string): Promise<Matiere> => {
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.matierePremiere.findUnique({ where: { id: id }, select: { designation: true } })
                if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

                const checkFirst = await tx.matierePremiere.findFirst({
                    where: {
                        id: {
                            not: id
                        },
                        designation: {
                            equals: data.designation,
                            mode: 'insensitive'
                        }
                    }
                })
                if (checkFirst !== null) throw new HttpException(errors.NAME_ALREADY_EXIST, HttpStatus.BAD_REQUEST);


                const matiere = await tx.matierePremiere.update({
                    where: { id },
                    data: {
                        designation: data.designation,
                        description: data.description,
                        unite: {
                            connect: { id: data.uniteId }
                        }
                    },
                    select: {
                        id: true,
                        numero: true,
                        designation: true,
                        description: true,
                        createdAt: true,
                        unite: {
                            select: {
                                id: true,
                                libelle: true,
                                symbole: true
                            }
                        }
                    }
                })

                const description = `Modification de la matiere premiere: ${check.designation} -> ${data.designation}`
                this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return matiere
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    archive = async (id: string, userId: string): Promise<Matiere> => {
        const check = await this.db.matierePremiere.findUnique({ where: { id: id }, select: { designation: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const matiere = await this.db.matierePremiere.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: {
                id: true,
                numero: true,
                designation: true,
                description: true,
                createdAt: true,
                unite: {
                    select: {
                        id: true,
                        libelle: true,
                        symbole: true
                    }
                }
            }
            // select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Archivage de la matiere premiere: ${check.designation}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return matiere
    }

    remove = async (id: string, userId: string): Promise<Matiere> => {
        const check = await this.db.matierePremiere.findUnique({ where: { id: id }, select: { designation: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const article = await this.db.matierePremiere.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: {
                id: true,
                numero: true,
                designation: true,
                description: true,
                createdAt: true,
                unite: {
                    select: {
                        id: true,
                        libelle: true,
                        symbole: true
                    }
                }
            }
            // select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Suppression logique de la matiere premiere: ${check.designation}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return article
    }

    destroy = async (id: string, userId: string): Promise<Matiere> => {
        const check = await this.db.matierePremiere.findUnique({ where: { id: id }, select: { designation: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const matiere = await this.db.matierePremiere.delete({
                where: { id },
                select: {
                    id: true,
                    numero: true,
                    designation: true,
                    description: true,
                    createdAt: true,
                    unite: {
                        select: {
                            id: true,
                            libelle: true,
                            symbole: true
                        }
                    }
                }
            })

            const description = `Suppression physique de la matiere premiere: ${check.designation}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return matiere
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
