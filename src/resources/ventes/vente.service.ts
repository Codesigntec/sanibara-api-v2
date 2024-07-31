import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Etat, PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { Vente, VenteFetcher, VenteTable } from "./vente.types";
import { errors } from "./vente.constant";
import { Pagination, PaginationQuery } from "src/common/types";


@Injectable()
export class VentesService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }


    list = async (filter: VenteFetcher, query: PaginationQuery): Promise<Pagination<VenteTable>> => {
        let conditions = { ...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if(query.orderBy){
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }

        if (filter.etat) { conditions = { ...conditions, etat: filter.etat } }

        const vente = await this.db.vente.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: { 
                id: true, 
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

        const totalCount = await this.db.unite.count({ where: conditions });

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
            
                const matiere = await tx.vente.create({
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
                        stockVente:{
                            create: data.stockVente.map((stockVente)=>({
                                quantiteVendue: stockVente.quantiteVendue,
                                stockProduiFini:{
                                    connect:{id: stockVente.stockProduiFiniId}
                                },
                                vente:{
                                    connect:{id:stockVente.venteId}
                                }
                            }))
                        }
                    },
                    include: {
                      client: true,
                      stockVente:{
                        include:{
                            stockProduiFini:true
                        }
                      }
                      
                    }
                })


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

                return matiere
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

}