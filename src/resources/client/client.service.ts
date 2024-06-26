import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import { ClientFetcher, ClientSaver, Client, ClientSelect } from './client.types';
import { errors } from './client.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class ClientService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: ClientFetcher, query: PaginationQuery): Promise<Pagination<Client>> => {
        const conditions = { ...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const clients = await this.db.client.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: {
                id: true,
                numero: true,
                nom: true,
                telephone: true,
                email: true,
                adresse: true,
                societe: true,
                createdAt: true,
            },
            orderBy: order
        })

        const totalCount = await this.db.client.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Client> = {
            data: clients,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<ClientSelect[]> => {
        const clients = await this.db.client.findMany({
            where: { removed: false, archive: false },
            select: { id: true, nom: true }
        })
        return clients
    }

    save = async (data: ClientSaver, userId: string): Promise<Client> => {

        const client = await this.db.client.create({
            data: {
                nom: data.nom,
                telephone: data.telephone,
                email: data.email,
                adresse: data.adresse,
                societe: data.societe,
            },
            select: {
                id: true,
                numero: true,
                nom: true,
                telephone: true,
                email: true,
                adresse: true,
                societe: true,
                createdAt: true,
            }
        })

        const description = `Ajout de client: ${data.nom}`
        this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return client
    }

    update = async (id: string, data: ClientSaver, userId: string): Promise<Client> => {
        const check = await this.db.client.findUnique({ where: { id: id }, select: { nom: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const client = await this.db.client.update({
            where: { id },
            data: {
                nom: data.nom,
                telephone: data.telephone,
                email: data.email,
                adresse: data.adresse,
                societe: data.societe,
            },
            select: {
                id: true,
                numero: true,
                nom: true,
                telephone: true,
                email: true,
                adresse: true,
                societe: true,
                createdAt: true,
            }
        })

        const description = `Modification du client: ${check.nom} -> ${data.nom}`
        this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return client
    }

    archive = async (id: string, userId: string): Promise<Client> => {
        const check = await this.db.client.findUnique({ where: { id: id }, select: { nom: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const client = await this.db.client.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: {
                id: true,
                numero: true,
                nom: true,
                telephone: true,
                email: true,
                adresse: true,
                societe: true,
                createdAt: true,
            }
        })

        const description = `Archivage du client: ${check.nom}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return client
    }

    remove = async (id: string, userId: string): Promise<Client> => {
        const check = await this.db.client.findUnique({ where: { id: id }, select: { nom: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const client = await this.db.client.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: {
                id: true,
                numero: true,
                nom: true,
                telephone: true,
                email: true,
                adresse: true,
                societe: true,
                createdAt: true,
            }
        })

        const description = `Suppression logique du client: ${check.nom}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return client
    }

    destroy = async (id: string, userId: string): Promise<Client> => {
        const check = await this.db.client.findUnique({ where: { id: id }, select: { nom: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const client = await this.db.client.delete({
                where: { id },
                select: {
                    id: true,
                    numero: true,
                    nom: true,
                    telephone: true,
                    email: true,
                    adresse: true,
                    societe: true,
                    createdAt: true,
                }
            })

            const description = `Suppression physique du client: ${check.nom}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return client
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
