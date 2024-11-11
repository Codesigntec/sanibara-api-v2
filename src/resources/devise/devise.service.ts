import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeviseFetcher, DeviseSaver, Devise, DeviseSelect } from './devise.types';
import { errors } from './devise.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class DeviseService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: DeviseFetcher, query: PaginationQuery): Promise<Pagination<Devise>> => {

        let conditions = {}; // Inclure les autres filtres sauf `search`

        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if(query.orderBy){
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }

        if (filter.search) {
            conditions = {
                OR: [
                    { libelle: { contains: filter.search, mode: 'insensitive' } },
                    { symbole: { contains: filter.search, mode: 'insensitive' } }
                ]
            }
        }
        conditions = { ...conditions, removed: filter.removed, archive: filter.archive }

        const devises = await this.db.devise.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true, },
            orderBy: order
        })

        const totalCount = await this.db.devise.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Devise> = {
            data: devises,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<DeviseSelect[]> => {
        const devises = await this.db.devise.findMany({
            where: { removed: false, archive: false },
            select: { id: true, libelle: true }
        })
        return devises
    }

    save = async (data: DeviseSaver, userId: string): Promise<Devise> => {

        const totalCount = await this.db.devise.count();
        if (totalCount > 0) {
            throw new HttpException(errors.DEVISE_ALREADY_EXIST, HttpStatus.BAD_REQUEST);
        }

        
        const check = await this.db.devise.findFirst({
            where: {
                OR: [
                    { libelle: { equals: data.libelle, mode: 'insensitive' } },
                    { symbole: { equals: data.symbole, mode: 'insensitive' } }
                ]
            }
        })
        if (check !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

  

        const devise = await this.db.devise.create({
            data: {
                libelle: data.libelle,
                symbole: data.symbole,
            },
            select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true }
        })



        const description = `Ajout de devise: ${data.libelle}`
        this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return devise
    }

    update = async (id: string, data: DeviseSaver, userId: string): Promise<Devise> => {
        const check = await this.db.devise.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const checkFirst = await this.db.devise.findFirst({
            where: {
                id: {
                    not: id
                },
                OR: [
                    { libelle: { equals: data.libelle, mode: 'insensitive' } },
                    { symbole: { equals: data.symbole, mode: 'insensitive' } }
                ]
            }
        })
        if (checkFirst !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const devise = await this.db.devise.update({
            where: { id },
            data: {
                libelle: data.libelle,
                symbole: data.symbole,
            },
            select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true }
        })

        const description = `Modification du devise: ${check.libelle} -> ${data.libelle}`
        this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return devise
    }

    archive = async (id: string, userId: string): Promise<Devise> => {
        const check = await this.db.devise.findUnique({ where: { id: id }, select: { libelle: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const devise = await this.db.devise.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true }
        })

        const description = `Archivage du devise: ${check.libelle}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return devise
    }

    remove = async (id: string, userId: string): Promise<Devise> => {
        const check = await this.db.devise.findUnique({ where: { id: id }, select: { libelle: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const devise = await this.db.devise.update({
            where: { id },
            data: {
                removed: !check.removed,
                updatedAt: new Date(),
            },
            select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true }
        })

        const description = `Suppression logique du devise: ${check.libelle}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return devise
    }

    destroy = async (id: string, userId: string): Promise<Devise> => {
        const check = await this.db.devise.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const devise = await this.db.devise.delete({
                where: { id },
                select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true }
            })

            const description = `Suppression physique du devise: ${check.libelle}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return devise
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
