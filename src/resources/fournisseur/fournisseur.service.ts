import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FournisseurFetcher, FournisseurSaver, Fournisseur, FournisseurSelect } from './fournisseur.types';
import { errors } from './fournisseur.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class FournisseurService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: FournisseurFetcher, query: PaginationQuery): Promise<Pagination<Fournisseur>> => {
        const conditions = { ...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const fournisseurs = await this.db.fournisseur.findMany({
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

        const totalCount = await this.db.fournisseur.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Fournisseur> = {
            data: fournisseurs,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<FournisseurSelect[]> => {
        const fournisseurs = await this.db.fournisseur.findMany({
            where: { removed: false, archive: false },
            select: { id: true, nom: true }
        })
        return fournisseurs
    }

    save = async (data: FournisseurSaver, userId: string): Promise<Fournisseur> => {

        const fournisseur = await this.db.fournisseur.create({
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

        const description = `Ajout du fournisseur: ${data.nom}`
        this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return fournisseur
    }

    update = async (id: string, data: FournisseurSaver, userId: string): Promise<Fournisseur> => {
        const check = await this.db.fournisseur.findUnique({ where: { id: id }, select: { nom: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const fournisseur = await this.db.fournisseur.update({
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

        const description = `Modification du fournisseur: ${check.nom} -> ${data.nom}`
        this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return fournisseur
    }

    archive = async (id: string, userId: string): Promise<Fournisseur> => {
        const check = await this.db.fournisseur.findUnique({ where: { id: id }, select: { nom: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const fournisseur = await this.db.fournisseur.update({
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

        const description = `Archivage du fournisseur: ${check.nom}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return fournisseur
    }

    remove = async (id: string, userId: string): Promise<Fournisseur> => {
        const check = await this.db.fournisseur.findUnique({ where: { id: id }, select: { nom: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const fournisseur = await this.db.fournisseur.update({
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

        const description = `Suppression logique du fournisseur: ${check.nom}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return fournisseur
    }

    destroy = async (id: string, userId: string): Promise<Fournisseur> => {
        const check = await this.db.fournisseur.findUnique({ where: { id: id }, select: { nom: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const fournisseur = await this.db.fournisseur.delete({
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

            const description = `Suppression physique du fournisseur: ${check.nom}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return fournisseur
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
