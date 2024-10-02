import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Trace, TraceFetcher, TraceSaver } from './trace.types';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class TraceService {

    constructor(
        private db: PrismaClient
    ) { }

    list = async (filter: TraceFetcher, query: PaginationQuery): Promise<Pagination<Trace>> => {
        let conditions = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        // let filters = { }
        if (filter.action) {
            conditions = {
                action: {
                    contains: filter.action,
                    mode: "insensitive"
                }
            }
        }
        // if (filter.categorieId) { conditions = { ...conditions, categorieId: filter.categorieId } }
        if (filter.utilisateurId) { 
            conditions = { 
                utilisateurId: filter.utilisateurId 
            } }
        // if(filter.paymentMethode){ conditions = { ...conditions, paymentMethode: filter.paymentMethode } }

        if (filter.debut || filter.fin) {
            let dateFilter = {};
            if (filter.debut) {
                dateFilter = {gte: new Date(filter.debut) };
            }
            if (filter.fin) {
                dateFilter = {lte: new Date(filter.fin) };
            }
            conditions = { createdAt: dateFilter };
        }
        // conditions = { ...conditions, removed: filter.removed, archive: filter.archive }

        // Appliquer l'ordre de tri
        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc';
        } else {
            // Par défaut, trier par createdAt du plus récent au plus ancien
            order = { createdAt: 'desc' };
        }

        if (filter.search) {
            // Crée une clause OR pour les recherches
            conditions = {
                OR: [
                    { action: { contains: filter.search, mode: 'insensitive' } },
                    { description: { contains: filter.search, mode: 'insensitive' } },
                    {
                        utilisateur: {
                            email: { contains: filter.search, mode: 'insensitive' }
                        }
                    }
                ]
            };
        }

        conditions = { ...conditions}


        const traces = await this.db.trace.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: {
                id: true,
                action: true,
                description: true,
                createdAt: true,
                utilisateur: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: order
        })

        const totalCount = await this.db.trace.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Trace> = {
            data: traces,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination


        // let filter = { }
        // if(data.action){ filter = { ...filter, action: data.action } }
        // if(data.utilisateurId){ filter = { ...filter, utilisateurId: data.utilisateurId } }

        // if (data.start || data.end) {
        //     let dateFilter = {};
        //     if (data.start) {
        //         dateFilter = { ...dateFilter, gte: new Date(data.start) };
        //     }
        //     if (data.end) {
        //         dateFilter = { ...dateFilter, lte: new Date(data.end) };
        //     }
        //     filter = { ...filter, date: dateFilter };
        // }

        // const traces = await this.db.trace.findMany({ 
        //     where: filter,
        //     select: { id: true, action: true, description: true, createdAt: true, utilisateur: { select: { email: true } } }
        // })
        // return traces
    }

    logger = async (data: TraceSaver): Promise<boolean> => {
        try {
            const log = await this.db.trace.create({
                data: {
                    description: data.description,
                    action: data.action,
                    utilisateur: {
                        connect: {
                            id: data.userId
                        }
                    }
                }
            })
            if (log.id) return true
            else return false
        } catch (err: any) {
            return false
        }
    }
}
