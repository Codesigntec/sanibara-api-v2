import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DepenseFetcher, DepenseSaver, Depense } from './depense.types';
import { errors } from './depense.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class DepenseService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: DepenseFetcher, query: PaginationQuery): Promise<Pagination<Depense>> => {
        let conditions = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        if (filter.motif) {
            conditions = {
                ...conditions,
                motif: {
                    contains: filter.motif,
                    mode: "insensitive"
                }
            }
        }

        if (filter.min || filter.max) {
            let amountFilter = {};
            if (filter.min) {
                amountFilter = { ...amountFilter, gte: filter.min };
            }
            if (filter.max) {
                amountFilter = { ...amountFilter, lte: filter.max };
            }
            conditions = { ...conditions, montant: amountFilter };
        }

        if (filter.debut || filter.fin) {
            let dateFilter = {};
            if (filter.debut) {
                dateFilter = { ...dateFilter, gte: new Date(filter.debut) };
            }
            if (filter.fin) {
                dateFilter = { ...dateFilter, lte: new Date(filter.fin) };
            }
            conditions = { ...conditions, date: dateFilter };
        }
        conditions = { ...conditions, removed: filter.removed, archive: filter.archive }

        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const depenses = await this.db.depense.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: {
                id: true,
                numero: true,
                motif: true,
                montant: true,
                date: true,
                createdAt: true
            },
            orderBy: order
        })

        const totalCount = await this.db.depense.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Depense> = {
            data: depenses,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }


    save = async (data: DepenseSaver, userId: string): Promise<Depense> => {
        return await this.db.$transaction(async (tx) => {
            try {

                const depense = await tx.depense.create({
                    data: {
                        motif: data.motif,
                        montant: data.montant,
                        date: new Date(data.date)
                    },
                    select: {
                        id: true,
                        numero: true,
                        motif: true,
                        montant: true,
                        date: true,
                        createdAt: true
                    }
                })


                const description = `Ajout de depense: ${data.motif}`
                this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return depense
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    update = async (id: string, data: DepenseSaver, userId: string): Promise<Depense> => {
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.depense.findUnique({ where: { id: id }, select: { motif: true } })
                if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

                const depense = await tx.depense.update({
                    where: { id },
                    data: {
                        motif: data.motif,
                        montant: data.montant,
                        date: new Date(data.date)
                    },
                    select: {
                        id: true,
                        numero: true,
                        motif: true,
                        montant: true,
                        date: true,
                        createdAt: true
                    }
                })

                const description = `Modification de la depense: ${check.motif} -> ${data.motif}`
                this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return depense
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    archive = async (id: string, userId: string): Promise<Depense> => {
        const check = await this.db.depense.findUnique({ where: { id: id }, select: { motif: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const depense = await this.db.depense.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: {
                id: true,
                numero: true,
                motif: true,
                montant: true,
                date: true,
                createdAt: true
            }
        })

        const description = `Archivage de la depense: ${check.motif}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return depense
    }

    remove = async (id: string, userId: string): Promise<Depense> => {
        const check = await this.db.depense.findUnique({ where: { id: id }, select: { motif: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const depense = await this.db.depense.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: {
                id: true,
                numero: true,
                motif: true,
                montant: true,
                date: true,
                createdAt: true
            }
        })

        const description = `Suppression logique de la depense: ${check.motif}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return depense
    }

    destroy = async (id: string, userId: string): Promise<Depense> => {
        const check = await this.db.depense.findUnique({ where: { id: id }, select: { motif: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const depense = await this.db.depense.delete({
                where: { id },
                select: {
                    id: true,
                    numero: true,
                    motif: true,
                    montant: true,
                    date: true,
                    createdAt: true
                }
            })

            const description = `Suppression physique de la depense: ${check.motif}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return depense
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
