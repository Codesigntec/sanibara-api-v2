import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UniteFetcher, UniteSaver, Unite, UniteSelect } from './unite.types';
import { errors } from './unite.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class UniteService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: UniteFetcher, query: PaginationQuery): Promise<Pagination<Unite>> => {
        const conditions = { ...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if(query.orderBy){
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const unites = await this.db.unite.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: { id: true, libelle: true, createdAt: true, },
            orderBy: order
        })

        const totalCount = await this.db.unite.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Unite> = {
            data: unites,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<UniteSelect[]> => {
        const unites = await this.db.unite.findMany({ 
            where: { removed: false, archive: false },
            select: { id: true, libelle: true }
        })
        return unites
    }

    save = async (data: UniteSaver, userId: string): Promise<Unite> => {
        const check = await this.db.unite.findFirst({ 
            where: { 
                libelle: { 
                    equals: data.libelle,
                    mode: 'insensitive'
                } 
            }
        })
        if (check !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const unite = await this.db.unite.create({
            data: {
                libelle: data.libelle
            },
            select: { id: true, libelle: true, createdAt: true }
        })

        const description = `Ajout de l'unité: ${data.libelle}`
        this.trace.logger({action: 'Ajout', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

        return unite
    }

    update = async (id: string, data: UniteSaver, userId: string): Promise<Unite> => {
        const check = await this.db.unite.findUnique({ where:  {id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const checkFirst = await this.db.unite.findFirst({ 
            where: { 
                id: {
                    not: id
                },
                libelle: { 
                    equals: data.libelle,
                    mode: 'insensitive'
                } 
            }
        })
        if (checkFirst !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const unite = await this.db.unite.update({
            where: { id },
            data: {
                libelle: data.libelle
            },
            select: { id: true, libelle: true, createdAt: true }
        })

        const description = `Modification de l'unité: ${check.libelle} -> ${data.libelle}`
        this.trace.logger({action: 'Modification', description, userId }).then(res=>console.log("TRACE SAVED: ", res))


        return unite
    }

    archive = async (id: string, userId: string): Promise<Unite> => {
        const check = await this.db.unite.findUnique({ where:  {id: id }, select: { libelle: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const unite = await this.db.unite.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: { id: true, libelle: true, createdAt: true }
        })

        const description = `Archivage de l'unité: ${check.libelle}`
        this.trace.logger({action: 'Archivage', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

        return unite
    }

    remove = async (id: string, userId: string): Promise<Unite> => {
        const check = await this.db.unite.findUnique({ where:  {id: id }, select: { libelle: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const unite = await this.db.unite.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: { id: true, libelle: true, createdAt: true }
        })

        const description = `Suppression logique de l'unité: ${check.libelle}`
        this.trace.logger({action: 'Suppression logique', description, userId }).then(res=>console.log("TRACE SAVED: ", res))


        return unite
    }

    destroy = async (id: string, userId: string): Promise<Unite> => {
        const check = await this.db.unite.findUnique({ where:  {id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const unite = await this.db.unite.delete({
                where: { id },
                select: { id: true, libelle: true, createdAt: true }
            })

            const description = `Suppression physique de l'unité: ${check.libelle}`
            this.trace.logger({action: 'Suppression physique', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

            return unite
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
