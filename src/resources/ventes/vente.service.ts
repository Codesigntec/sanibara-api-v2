import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Etat, PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { PaiementSave, PaiementVente, StockProduiFiniDto, StockVente, Vente, VenteArchiveDeleteAndDestory, VenteFetcher, VenteTable } from "./vente.types";
import { errors } from "./vente.constant";
import { Pagination, PaginationQuery } from "src/common/types";


@Injectable()
export class VentesService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }


    findById = async (id: string): Promise<Vente> => {
        return await this.db.vente.findUnique({
            where: { id },
            include: {
                client: true,
                stockVente: {
                    select:{
                        quantiteVendue:true,
                        stockProduiFiniId: true,
                        quantiteDevis: true,
                        prix_unitaire:true,
                        venteId: true
                    }
                },
                paiements: true
            }
        });
    }


    list = async (filter: VenteFetcher, etat: string, query: PaginationQuery): Promise<Pagination<VenteTable>> => {
        let conditions: any = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if(query.orderBy){
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }

        if (etat !== null && etat !== undefined && etat !== '' && etat === 'true') { conditions = { ...conditions, etat: true } }
        if (etat !== null && etat !== undefined && etat !== '' && etat === 'false') { conditions = { ...conditions, etat: false } }

        if (filter.search) {
            conditions = {
                OR: [
                    { reference: { contains: filter.search, mode: 'insensitive' } }, // Recherche par référence dans `Vente`
                    {
                      client: {
                        nom: { contains: filter.search, mode: 'insensitive' }, // Recherche par nom dans `Client`
                        telephone: { contains: filter.search, mode: 'insensitive' }, 
                        email: { contains: filter.search, mode: 'insensitive' }, 
                        societe: { contains: filter.search, mode: 'insensitive' }, 
                      }
                    }
                  ]
            };
          }
          conditions = { ...conditions, removed: filter.removed, archive: filter.archive }
        
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
                etat: true,
                montant: true,
                tva: true,
                createdAt: true,
                client: {
                    select: {
                        id: true,
                        nom: true,
                        telephone: true,
                        email: true,
                        adresse: true,
                        societe: true
                    }
                },
                paiements: {
                    select: {
                        id: true,
                        montant: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                stockVente:true
                

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
            
               if (data.dateVente > new Date()) {
                throw new HttpException(errors.DATE_VENTE_INVALIDE, HttpStatus.BAD_REQUEST)
               }
               const totalPaiements = data.paiements.reduce((acc, paiement) => acc +  Number(paiement.montant) == null || Number(paiement.montant) == undefined ? 0 : Number(paiement.montant), 0);
               const isVente = data.etat;
               if (isVente) {
                    if (totalPaiements > data.montant) {
                    throw new HttpException(errors.PAYE_SUPPERIEUR_MONTANT, HttpStatus.BAD_REQUEST)
                    }
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
              
              let dateVente: Date;
              if (data.dateVente === null || data.dateVente === undefined) {
                dateVente = new Date();
              }else{
                dateVente = new Date(data.dateVente);
              }

              let references: string = "";
              
              if(data.reference === null || data.reference === undefined || data.reference === ''){
                references = data.etat ? `REF_VENTE_${new Date().getTime()}` : `REF_DEVIS_${new Date().getTime()}`;
              }else{
                references = data.reference
              } 

                const vente = await tx.vente.create({
                    data: {
                        reference: references,
                        montant: data.montant,
                        tva: data.tva ? data.tva : 0,
                        paiements: {
                            create: data.paiements.map((paiement) => ({
                              montant: Number(paiement.montant) == null || Number(paiement.montant) == undefined ? 0 : Number(paiement.montant),
                            })),
                          },
                        etat: data.etat,
                        reliquat: data.montant - totalPaiements,
                        dateVente: dateVente,
                       // Inclure client seulement si clientId est fourni
                       ...(data.clientId ? { client: { connect: { id: data.clientId } } } : {}),
                    },
                    include: {
                      client: true,
                      paiements: true,
                    }
                })

                await Promise.all(data.stockVente.map(async (stockVente) => {
                    
                    let quantiteVendu: number = 0;
                    let quantiteDevis: number = 0;
                    if (isVente) {
                        quantiteVendu = stockVente.quantiteVendue
                        quantiteDevis = 0
                    }else{
                        quantiteVendu = 0
                        quantiteDevis = stockVente.quantiteVendue
                    }
                 await tx.stockVente.create({
                    data: {
                        quantiteVendue: quantiteVendu,
                        quantiteDevis: quantiteDevis,
                        prix_unitaire: stockVente.prix_unitaire,
                        stockProduiFini: {
                            connect: { id: stockVente.stockProduiFiniId }
                        },
                        vente: {
                          connect: { id: vente.id }
                        }
                      }
                    });
                 }));

                const description = `Ajout de'une vente: ${data.reference}`
                this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                // return vente
                return await tx.vente.findUnique({
                    where: { id: vente.id },
                    include: {
                        client: true,
                        paiements: true,
                        stockVente: true
                    }
                });

            } catch (error: any) {
                if (error.status) {
                    console.log(error);
                    throw new HttpException(error.message, error.status);
                }
                else{
                    console.log(error);
                    throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
                } 
            }
        });
    }


    update = async (id: string, data: Vente, userId: string): Promise<Vente> => {
        return await this.db.$transaction(async (tx) => {
            // let lastStockVente: any;
            try {
                const check = await tx.vente.findUnique({
                    where: { id: id },
                    select: { id: true, paiements: true, stockVente: true, etat: true }
                });
    
                if (!check) {
                    throw new HttpException(errors.NOT_VENTE_EXIST, HttpStatus.BAD_REQUEST);
                }
                let ach = check;
    
                const totalPaiementsOld = check.paiements.reduce((acc, paiement) => acc + (Number(paiement.montant) || 0), 0);
                if (data.paiements[0].montant > data.montant) {
                    throw new HttpException(errors.PAYE_SUPPERIEUR_MONTANT, HttpStatus.BAD_REQUEST)
                }
                if (data.dateVente > new Date()) {
                    throw new HttpException(errors.DATE_VENTE_INVALIDE, HttpStatus.BAD_REQUEST)
                }
                
                if (data.etat) {
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

                let dateVente: Date;
                if (data.dateVente === null || data.dateVente === undefined) {
                  dateVente = new Date();
                }else{
                  dateVente = new Date(data.dateVente);
                }

                let references: string = "";

                if (data.reference === null || data.reference === undefined || data.reference === '') {
                  references = data.etat ? "REF_VENTE_" + dateVente : "REF_DEVIS_" + dateVente;
                }else{
                  references = data.reference
                }

                const updatedVente = await tx.vente.update({
                    where: { id },
                    data: {
                        reference: references,
                        montant: data.montant,
                        tva: data.tva,
                        paiements: {
                            create: data.paiements
                                .map((paiement) => ({
                                    montant: Number(paiement.montant) - totalPaiementsOld,
                                })),
                        },
                        etat: data.etat,
                        reliquat: data.montant - Number(data.paiements[0].montant),
                        dateVente: dateVente,
                        // client: {
                        //     connect: { id: data.clientId }
                        // },
                        ...(data.clientId ? { client: { connect: { id: data.clientId } } } : {}),
                    },
                    include: {
                        client: true,
                        paiements: true,
                        stockVente: true, 
                    }
                });

                // Récupérer les IDs existants
                const existingStockVente = await tx.stockVente.findMany({
                    where: { venteId: id },
                    select: { id: true, stockProduiFiniId: true, venteId: true }
                });
                
                 // Traitement des nouvelles entrées stockVente
                await Promise.all(data.stockVente.map(async (stockVente) => {
                    let quantiteVendu: number = 0;
                    let quantiteDevis: number = 0;

                    if (check.etat) {
                        quantiteVendu = stockVente.quantiteVendue;
                        quantiteDevis = 0;
                    } else {
                        quantiteVendu = 0;
                        quantiteDevis = stockVente.quantiteVendue;
                    }

                    // Création des nouveaux stocks
                    const save = await tx.stockVente.create({
                        data: {
                            quantiteDevis: quantiteDevis,
                            quantiteVendue: quantiteVendu,
                            prix_unitaire: stockVente.prix_unitaire,
                            stockProduiFini: {
                                connect: { id: stockVente.stockProduiFiniId }
                            },
                            vente: {
                                connect: { id: id }
                            }
                        }
                    });

                    console.log("=====================CREATED DATA========================");
                    console.log(save);
                }));

                await Promise.all(
                    ach.paiements
                        .filter((p: PaiementVente) => p.montant === 0 || p.montant < 0 || p.montant === null || p.montant === undefined)
                        .map((p: PaiementVente) => this.db.paiementVente.delete({ where: { id: p.id } }))
                );

                await Promise.all(
                    existingStockVente.map((stock: any) => this.db.stockVente.delete({ where: { id: stock.id } }))
                )

                const description = `Mise à jour de la vente: ${data.reference}`;
                this.trace.logger({ action: 'Mise à jour', description, userId }).then(res => console.log("TRACE SAVED: ", res));
    
                return await tx.vente.findUnique({
                    where: { id: updatedVente.id },
                    include: {
                        client: true,
                        paiements: true,
                        stockVente: true
                    }
                });
    
            } catch (error: any) {
                console.log('Error during transaction:', error);
    
                // if (lastStockVente) {
                //     await Promise.all(lastStockVente.map(async (stockVente: any) => {
                //         await tx.stockVente.create({
                //             data: {
                //                 quantiteVendue: stockVente.quantiteVendue,
                //                 prix_unitaire: stockVente.prix_unitaire,
                //                 stockProduiFini: {
                //                     connect: { id: stockVente.stockProduiFiniId }
                //                 },
                //                 vente: {
                //                     connect: { id: id }
                //                 }
                //             }
                //         });
                //     }));
                // }
    
                if (error.status) {
                    throw new HttpException(error.message, error.status);
                } else {
                    throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
                }
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

    // ============== QUANTITE RESTANT ==============

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



    // ======================= PAIEMENTS =========================
        // Méthode pour ajouter un paiement à un achat existant
        savePaiementToVente = async (venteId: string, paiement: PaiementSave, userId: string): Promise<PaiementVente> => {
            // Récupérer l'achat existant par son ID avec les paiements associés
            const vente = await this.db.vente.findUnique({
              where: { id: venteId },
              include: { 
                paiements: true,
                stockVente: true
              },
            });
    
            if (!vente) {
              throw new HttpException(errors.NOT_VENTE_EXIST, HttpStatus.NOT_FOUND);
            }
    
            // Calculer le montant total déjà payé
            const montantTotalPaye = vente.paiements.reduce((acc, p) => acc + p.montant, 0);

            const reliquat: number = vente.montant - montantTotalPaye
    
            // Vérifier si le paiement proposé ne dépasse pas le reliquat
            if (paiement.montant > reliquat) {
              throw new HttpException(errors.MONTANT_DEPASSE_RELIQUA, HttpStatus.NOT_ACCEPTABLE);
            }
    
            let newPaiement: PaiementVente;
    
            await this.db.$transaction(async (tx) => {
              // Ajouter le paiement à l'achat
              newPaiement = await tx.paiementVente.create({
                data: {
                  montant: paiement.montant,
                  vente: { connect: { id: venteId } },
                },
              });
    
              // Mettre à jour l'achat pour refléter le paiement ajouté
                tx.vente.update({
                where: { id: venteId },
                data: {
                  paiements: {
                    connect: { id: newPaiement.id },
                  },
                },
                include: {
                  paiements: true, // Inclure les paiements mis à jour dans la réponse
                },
              });
            });
            
            const description = `Paiement de ${paiement.montant} pour l'achat ${venteId}`
            this.trace.logger({action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res));
    
            return newPaiement;
          };

        updatePaiement = async (id: string, data: PaiementSave, venteId: string ,userId: string): Promise<PaiementVente> => {
        const check = await this.db.paiementVente.findUnique({ where:  {id: id }, select: { montant: true } })
        if (!check) throw new HttpException(errors.PAIEMENT_NOT_EXIST, HttpStatus.BAD_REQUEST);
    
            // Récupérer l'achat existant par son ID avec les paiements associés
            const vente = await this.db.vente.findUnique({
            where: { id: venteId },
            include: { 
                stockVente: true, 
                paiements: true,
            },
            });
    
            if (!vente) {
            throw new HttpException(errors.NOT_VENTE_EXIST, HttpStatus.NOT_FOUND);
            }
    
            // Calculer le montant total déjà payé
            let montantTotalPaye = vente.paiements.reduce((acc, p) => acc + p.montant, 0);

            // Calculer le reliquat restant à payer
            montantTotalPaye = montantTotalPaye - check.montant;
            const totaux = montantTotalPaye + data.montant

            // Vérifier si le paiement proposé ne dépasse pas le reliquat
            if (totaux > vente.montant) {
            throw new HttpException(errors.MONTANT_DEPASSE_RELIQUA, HttpStatus.NOT_ACCEPTABLE);
            }
    
        const paiementSaver = await this.db.paiementVente.update({
            where: { id },
            data: {
                montant: data.montant
            },
            select: { id: true, montant: true, createdAt: true, updatedAt: true },
        })
    
        const description = `Modification du paiement: ${check.montant} -> ${data.montant} pour l'achat ${venteId}`
        this.trace.logger({action: 'Modification', description, userId }).then(res=>console.log("TRACE SAVED: ", res))
    
    
        return paiementSaver
        }
      
        destroyPaiement = async (id: string, userId: string): Promise<PaiementVente> => {
            const check = await this.db.paiementVente.findUnique({ where: { id: id }, select: { montant: true } })
            if (!check) throw new HttpException(errors.NOT_EXIST_PAIEMENT, HttpStatus.BAD_REQUEST);
    
            try {
                const paiementsDestroy = await this.db.paiementVente.delete({
                    where: { id },
                    select: {
                      id: true,
                      montant: true,
                      updatedAt: true,
                      createdAt: true,
                    }
                })
                const description = `Suppression physique du paiement: ${check.montant}`
                this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))
                
    
                return paiementsDestroy
            } catch (_: any) {
                throw new HttpException(errors.NOT_REMOVABLE_PAIEMENT, HttpStatus.BAD_REQUEST);
            }
        }


        //===================STOCK PRODUIT FINI====================


        findByIdStockProduiFini = async (id: string): Promise<StockProduiFiniDto> => {
            return await this.db.stockProduiFini.findUnique({
                where: { id },
                include: {
                    produitFini: true,
                    
                }
            });
        }
}