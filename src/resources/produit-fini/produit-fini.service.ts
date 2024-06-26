import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ProduitFetcher, ProduitSaver, Produit, ProduitSelect, ProduitFull, ProduitFilter } from './produit-fini.types';
import { errors } from './produit-fini.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class ProduitService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: ProduitFetcher, query: PaginationQuery): Promise<Pagination<Produit>> => {
        let conditions = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        // let filters = { }
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


        const matieres = await this.db.produitFini.findMany({
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
                        libelle: true
                    }
                }
            },
            orderBy: order
        })

        const totalCount = await this.db.produitFini.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Produit> = {
            data: matieres,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<ProduitSelect[]> => {
        const matieres = await this.db.produitFini.findMany({
            where: { removed: false, archive: false },
            select: { id: true, designation: true }
        })
        return matieres
    }

    findById = async (id: string): Promise<ProduitFull> => {
        const matiere = await this.db.produitFini.findUnique({
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
                        createdAt: true
                    }
                }
            }
        })
        if (matiere === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
        return matiere
    }

    save = async (data: ProduitSaver, userId: string): Promise<Produit> => {
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.produitFini.findFirst({
                    where: {
                        designation: {
                            equals: data.designation,
                            mode: 'insensitive'
                        }
                    }
                })
                if (check !== null) throw new HttpException(errors.NAME_ALREADY_EXIST, HttpStatus.BAD_REQUEST);


                const matiere = await tx.produitFini.create({
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
                                libelle: true
                            }
                        }
                    }
                })


                const description = `Ajout du produit fini: ${data.designation}`
                this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return matiere
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    filter = async (data: ProduitFilter, filter: ProduitFetcher, query: PaginationQuery): Promise<Pagination<Produit> > => {
        let conditions = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        // let filters = { }
        // if (data.categorieId) { conditions = { ...conditions, categorieId: data.categorieId } }
        if (data.uniteId) { conditions = { ...conditions, uniteId: data.uniteId } }
        // if(data.paymentMethode){ conditions = { ...conditions, paymentMethode: data.paymentMethode } }

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


        const matieres = await this.db.produitFini.findMany({
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
                        libelle: true
                    }
                }
            },
            orderBy: order
        })

        const totalCount = await this.db.produitFini.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Produit> = {
            data: matieres,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    update = async (id: string, data: ProduitSaver, userId: string): Promise<Produit> => {
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.produitFini.findUnique({ where: { id: id }, select: { designation: true } })
                if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

                const checkFirst = await tx.produitFini.findFirst({
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


                const matiere = await tx.produitFini.update({
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
                                libelle: true
                            }
                        }
                    }
                })

                const description = `Modification du produit fini: ${check.designation} -> ${data.designation}`
                this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return matiere
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    archive = async (id: string, userId: string): Promise<Produit> => {
        const check = await this.db.produitFini.findUnique({ where: { id: id }, select: { designation: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const matiere = await this.db.produitFini.update({
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
                        libelle: true
                    }
                }
            }
            // select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Archivage du produit fini: ${check.designation}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return matiere
    }

    remove = async (id: string, userId: string): Promise<Produit> => {
        const check = await this.db.produitFini.findUnique({ where: { id: id }, select: { designation: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const article = await this.db.produitFini.update({
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
                        libelle: true
                    }
                }
            }
            // select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Suppression logique du produit fini: ${check.designation}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return article
    }

    destroy = async (id: string, userId: string): Promise<Produit> => {
        const check = await this.db.produitFini.findUnique({ where: { id: id }, select: { designation: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const matiere = await this.db.produitFini.delete({
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
                            libelle: true
                        }
                    }
                }
            })

            const description = `Suppression physique du produit fini: ${check.designation}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return matiere
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
