import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import { ClientFetcher, ClientSaver, Client, ClientSelect, StatistiqueClient } from './client.types';
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

    findOne = async (id: string): Promise<Client> => {
        const client = await this.db.client.findUnique({
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
        if (client === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
        return client
    }

    // statistique = async (id: string): Promise<StatistiqueClient[]> => {  
    //     const check = await this.db.client.findUnique({ where: { id: id }, select: { nom: true } })
    //     if (check === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
        
    //     let statistique: StatistiqueClient[] = []

    //     const vente = await this.db.vente.findMany({
    //         where: { clientId: id },
    //         select: { id: true, montant: true, createdAt: true, stockVente: true, dateVente: true, paiements: true, reliquat: true, tva: true },
    //     })

    //     if (vente.length > 0) {
    //       let stocks: any;
    //       let stockProduitFini: any ;
    //         vente.forEach(ventes => {
    //              stocks = ventes.stockVente.forEach(stock => {
    //                  stockProduitFini = this.db.stockProduiFini.findUnique({
    //                     where: { id: stock.stockProduiFiniId },
    //                     select: { id: true, magasin:{ select: { id: true, nom: true } }, produitFini: { select: { id: true, designation: true }} }
    //                 })
    //             })

    //             const stat: StatistiqueClient = {
    //                 montant: ventes.montant,
    //                 tva: ventes.tva,
    //                 date: ventes.dateVente,
    //                 paye: ventes.paiements.reduce((acc: number, val: any) => acc + val.montant, 0),
    //                 reliquat: ventes.reliquat,
    //                 magasin: stockProduitFini.magasin.nom
    //             }
    //             statistique.push(stat)
    //         })
    //         return statistique;
    //     }
    //   return null;
    // }


    statistique = async (id: string, query: PaginationQuery): Promise<Pagination<StatistiqueClient>> => {
        const check = await this.db.client.findUnique({
            where: { id: id },
            select: { nom: true }
        });
        if (check === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
    
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;
    
        const vente = await this.db.vente.findMany({
            take: limit,
            skip: offset,
            where: { clientId: id },
            select: {
                id: true, 
                montant: true, 
                createdAt: true, 
                stockVente: true, 
                dateVente: true, 
                paiements: true, 
                reliquat: true, 
                tva: true
            }
        });
    
        const totalCount = await this.db.vente.count({
            where: { clientId: id }
        });
    
        if (vente.length === 0) {
            return {
                data: [],
                totalPages: 0,
                totalCount: 0,
                currentPage: query.page ? query.page : 1,
                size: limit
            };
        }
    
        const statistique: StatistiqueClient[] = [];
    
        for (const ventes of vente) {
            const stocks = await Promise.all(
                ventes.stockVente.map(async (stock) => {
                    return await this.db.stockProduiFini.findUnique({
                        where: { id: stock.stockProduiFiniId },
                        select: { 
                            id: true, 
                            magasin: { select: { id: true, nom: true } }, 
                            produitFini: { select: { id: true, designation: true } } 
                        }
                    });
                })
            );
    
            // Suppose there is only one stock per vente, adjust as needed
            const stockProduitFini = stocks.length > 0 ? stocks[0] : null;
    
            const stat: StatistiqueClient = {
                montant: ventes.montant,
                tva: ventes.tva,
                date: ventes.dateVente,
                paye: ventes.paiements.reduce((acc: number, val: any) => acc + val.montant, 0),
                reliquat: ventes.reliquat,
                magasin: stockProduitFini?.magasin.nom ?? 'Unknown'
            };
            statistique.push(stat);
        }
    
        const totalPages = Math.ceil(totalCount / limit);
    
        return {
            data: statistique,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        };
    }
    
    
    
}
