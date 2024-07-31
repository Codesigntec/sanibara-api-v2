import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Etat, PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { Vente, VenteArchiveDeleteAndDestory, VenteFetcher, VenteTable } from "./vente.types";
import { errors } from "./vente.constant";
import { Pagination, PaginationQuery } from "src/common/types";


@Injectable()
export class VentesService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }


    list = async (filter: VenteFetcher, etat: string, query: PaginationQuery): Promise<Pagination<VenteTable>> => {
        let conditions = { ...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if(query.orderBy){
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }

        if (etat !== null && etat !== undefined && etat !== '' && etat !== 'true') { conditions = { ...conditions, etat: true } }
        if (etat !== null && etat !== undefined && etat !== '' && etat !== 'false') { conditions = { ...conditions, etat: false } }

        const vente = await this.db.vente.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: { 
                id: true, 
                numero: true,
                reference: true,
                dateVente: true,
                reliquat: true,
                montant: true,
                paye: true,
                tva: true,
                createdAt: true,
                client: {
                    select: {
                        id: true,
                        nom: true,
                        telephone: true,
                        email: true
                    }
                }

            },
            orderBy: order
        })

        const totalCount = await this.db.vente.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<VenteTable> = {
            data: vente,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }


    save = async (data: Vente, userId: string): Promise<Vente> => {
        return await this.db.$transaction(async (tx) => {
            try {
               if (data.paye > data.montant) {
                throw new HttpException(errors.PAYE_SUPPERIEUR_MONTANT, HttpStatus.BAD_REQUEST)
               }
               if (data.dateVente > new Date()) {
                throw new HttpException(errors.DATE_VENTE_INVALIDE, HttpStatus.BAD_REQUEST)
               }

              if (data.etat) {
                    // Check quantities before creating stockVente records
                    for (const stockVente of data.stockVente) {
                        const stock = await tx.stockProduiFini.findUnique({
                            where: { id: stockVente.stockProduiFiniId }
                        });
    
                        if (!stock) {
                            throw new HttpException(errors.STOCK_NOT_FOUND, HttpStatus.BAD_REQUEST);
                        }
    
                        if (stockVente.quantiteVendue > stock.qt_produit) {
                            throw new HttpException(errors.QUANTITE_INSUFFISANTE, HttpStatus.BAD_REQUEST);
                        }
                        if (stockVente.quantiteVendue <= 0) {
                            throw new HttpException(errors.QUANTITE_NON_VALID, HttpStatus.BAD_REQUEST);
                        }
                    }
              }
            
                const vente = await tx.vente.create({
                    data: {
                        reference: data.reference,
                        montant:data.montant,
                        tva: data.tva,
                        paye: data.paye,
                        etat: data.etat,
                        reliquat: data.montant - data.paye,
                        dateVente: new Date(data.dateVente),
                        client:{
                            connect:{id: data.cleintId}
                        },
                    },
                    include: {
                      client: true,
                    }
                })

            await Promise.all(data.stockVente.map(async (stockVente) => {
                 // Create stockVente records with the vente ID
                 await tx.stockVente.create({
                    data: {
                        quantiteVendue: stockVente.quantiteVendue,
                        stockProduiFini: {
                            connect: { id: stockVente.stockProduiFiniId }
                        },
                        vente: {
                            connect: { id: vente.id }
                        }
                    }
                });
            }));
                 // Update stockProduiFini quantities if etat is true
            if (data.etat) {
                await Promise.all(data.stockVente.map(async (stockVente) => {
                    const check = await tx.stockProduiFini.findUnique({
                        where: { id: stockVente.stockProduiFiniId },
                        select: { id: true }
                    });

                    if (!check) {
                        throw new HttpException(errors.NOT_PRODUI_FINI_EXIST, HttpStatus.BAD_REQUEST);
                    }

                    await tx.stockProduiFini.update({
                        where: { id: stockVente.stockProduiFiniId },
                        data: {
                            qt_produit: { decrement: stockVente.quantiteVendue }
                        },
                        select: { id: true }
                    });
                }));
            }



                const description = `Ajout de'une vente: ${data.reference}`
                this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return vente
            } catch (error: any) {
                if (error.status) {
                    throw new HttpException(error.message, error.status);
                console.log(error);
                }
                else{
                    console.log(error);
                    
                    throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
                } 
            }
        })
    }


    update = async (id: string, data: Vente, userId: string): Promise<Vente> => {
        return await this.db.$transaction(async (tx) => {
            try {

                const check = await tx.vente.findUnique({
                    where: { id: id },
                    select: { id: true }
                });

                if (!check) {
                    throw new HttpException(errors.NOT_VENTE_EXIST, HttpStatus.BAD_REQUEST);
                }


                if (data.paye > data.montant) {
                    throw new HttpException(errors.PAYE_SUPPERIEUR_MONTANT, HttpStatus.BAD_REQUEST)
                }
                if (data.dateVente > new Date()) {
                    throw new HttpException(errors.DATE_VENTE_INVALIDE, HttpStatus.BAD_REQUEST)
                }
    
                if (data.etat) {
                    // Check quantities before updating stockVente records
                    for (const stockVente of data.stockVente) {
                        const stock = await tx.stockProduiFini.findUnique({
                            where: { id: stockVente.stockProduiFiniId }
                        });
    
                        if (!stock) {
                            throw new HttpException(errors.STOCK_NOT_FOUND, HttpStatus.BAD_REQUEST);
                        }
    
                        if (stockVente.quantiteVendue > stock.qt_produit) {
                            throw new HttpException(errors.QUANTITE_INSUFFISANTE, HttpStatus.BAD_REQUEST);
                        }
                        if (stockVente.quantiteVendue <= 0) {
                            throw new HttpException(errors.QUANTITE_NON_VALID, HttpStatus.BAD_REQUEST);
                        }
                    }
                }
    
                const updatedVente = await tx.vente.update({
                    where: { id },
                    data: {
                        reference: data.reference,
                        montant: data.montant,
                        tva: data.tva,
                        paye: data.paye,
                        etat: data.etat,
                        reliquat: data.montant - data.paye,
                        dateVente: new Date(data.dateVente),
                        client: {
                            connect: { id: data.cleintId }
                        },
                        stockVente: {
                            create: data.stockVente.map((stockVente) => ({
                                quantiteVendue: stockVente.quantiteVendue,
                                stockProduiFini: {
                                    connect: { id: stockVente.stockProduiFiniId }
                                },
                                vente: {
                                    connect: { id }
                                }
                            }))
                        }
                    },
                    include: {
                        client: true,
                        stockVente: {
                            include: {
                                stockProduiFini: true
                            }
                        }
                    }
                });

                await tx.stockVente.deleteMany({
                    where: {
                      venteId: id,
                      id: {
                        notIn: data.stockVente.map((stockVente) => stockVente.venteId)
                      }
                    }
                  });
                  
    
                // Update stockProduiFini quantities if etat is true
                if (data.etat) {
                    await Promise.all(data.stockVente.map(async (stockVente) => {
                        const check = await tx.stockProduiFini.findUnique({
                            where: { id: stockVente.stockProduiFiniId },
                            select: { id: true }
                        });
    
                        if (!check) {
                            throw new HttpException(errors.NOT_PRODUI_FINI_EXIST, HttpStatus.BAD_REQUEST);
                        }
    
                        await tx.stockProduiFini.update({
                            where: { id: stockVente.stockProduiFiniId },
                            data: {
                                qt_produit: { decrement: stockVente.quantiteVendue }
                            },
                            select: { id: true }
                        });
                    }));
                }
    
                const description = `Mise à jour de la vente: ${data.reference}`
                this.trace.logger({ action: 'Mise à jour', description, userId }).then(res => console.log("TRACE SAVED: ", res))
    
                return updatedVente
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    

    archive = async (id: string, userId: string): Promise<VenteArchiveDeleteAndDestory> => {
        const check = await this.db.vente.findUnique({ where:  {id: id }, select: { reference: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_VENTE_EXIST, HttpStatus.BAD_REQUEST);

        const vente = await this.db.vente.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: { id: true, reference: true, createdAt: true }
        })

        const description = `Archivage de la vente: ${check.reference}`
        this.trace.logger({action: 'Archivage', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

        return vente
    }

    remove = async (id: string, userId: string): Promise<VenteArchiveDeleteAndDestory> => {
        const check = await this.db.vente.findUnique({ where:  {id: id }, select: { reference: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_VENTE_EXIST, HttpStatus.BAD_REQUEST);

        const vente = await this.db.vente.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: { id: true, reference: true, createdAt: true }
        })

        const description = `Suppression logique de la vente: ${check.reference}`
        this.trace.logger({action: 'Suppression logique', description, userId }).then(res=>console.log("TRACE SAVED: ", res))


        return vente
    }

    destroy = async (id: string, userId: string): Promise<VenteArchiveDeleteAndDestory> => {
        const check = await this.db.vente.findUnique({ where:  {id: id }, select: { reference: true } })
        if (!check) throw new HttpException(errors.NOT_VENTE_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const vente = await this.db.vente.delete({
                where: { id },
                select: { id: true, reference: true, createdAt: true }
            })

            const description = `Suppression physique de l'unité: ${check.reference}`
            this.trace.logger({action: 'Suppression physique', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

            return vente
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }



    quantiteRestant = async (id: string): Promise<number> => {
        const stockProduiFini = await this.db.stockProduiFini.findUnique({
            where: { id },
            include: { stockVente: true }
        })
        if (stockProduiFini === null) throw new HttpException(errors.NOT_PRODUI_FINI_EXIST, HttpStatus.BAD_REQUEST);

        // let quantite = 0

        // stockProduiFini.stockVente.forEach((stockVente) => {
        //     quantite += stockVente.quantiteVendue
        // })

        const quantiteVendue = stockProduiFini.stockVente?.reduce((total, stockVente) => total + stockVente.quantiteVendue, 0) || 0;
    
        return  stockProduiFini.qt_produit - quantiteVendue
    }
}