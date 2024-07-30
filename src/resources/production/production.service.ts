import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { ProdReturn, ProdSave, ProductionFetcher, Productions, ProductionsReturn, ProductionsSaver, ProdUpdate, tableReturn } from "./production.type";
import { errors } from "./production.constant";
import { Pagination, PaginationQuery } from "src/common/types";


@Injectable()
export class ProductionService {
    
    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }



    list = async (filter: ProductionFetcher, query: PaginationQuery): Promise<Pagination<ProductionsReturn>> => {
      let conditions = {}
      const limit = query.size ? query.size : 10;
      const offset = query.page ? (query.page - 1) * limit : 0;

      // let filters = { }
      if (filter.debut) {
          conditions = {
              ...conditions,
              designation: {
                  contains: filter.debut,
                  mode: "insensitive"
              }
          }
      }

      if (filter.debut || filter.fin) {
          let dateFilter = {};
          if (filter.debut) {
              dateFilter = { ...dateFilter, gte: new Date(filter.debut) };
          }
          if (filter.fin) {
              dateFilter = { ...dateFilter, lte: new Date(filter.fin) };
          }
          conditions = { ...conditions, createdAt: dateFilter };
      }
      conditions = { ...conditions, removed: filter.removed, archive: filter.archive }

      let order = {}
      if (query.orderBy) {
          order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
      }
      const production = await this.db.productions.findMany({
          take: limit,
          skip: offset,
          where: conditions,
          include: {
            stockProdFini: {
              include: {
                produitFini: true,
                magasin: true,
              },
            },
            productionLigneAchat: {
              include: {
                ligneAchat: {
                  include: {
                    matiere: true,
                    magasin: true,
                    achat: true
                  },
                },
              },
            },
            coutProduction: true
          },
          orderBy: order
      })



      const totalCount = await this.db.productions.count({ where: conditions });

      const totalPages = Math.ceil(totalCount / limit);
      const pagination: Pagination<ProductionsReturn> = {
          data: production,
          totalPages,
          totalCount,
          currentPage: query.page ? query.page : 1,
          size: limit
      }

      return pagination
     }

   save = async(data: ProdSave, userId: string): Promise<ProdReturn> =>{
    return await this.db.$transaction(async (tx) => {
      try {
        const check = await tx.productions.findFirst({
          where: {
            reference: {
              equals: data.reference,
              mode: 'insensitive',
            },
          },
        });
        if (check !== null)  throw new HttpException(errors.REFERENCE_ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const dateDebut = new Date(data.dateDebut);
        const dateFin = new Date(data.dateFin);
        
        if (dateDebut > dateFin) {
          throw new HttpException(errors.DATE_DEBUT_MUST_BE_BEFORE_DATE_FIN, HttpStatus.BAD_REQUEST);
        }
       //NOUS ALLONS VERIFIER S'IL Y A PAS DUPLICATION DE PRODUIT FINIS

        let ListIdProduitFini: string[] = [];
        let idSet = new Set<string>();
        let hasDuplicates = false;
        
        data.stockProdFini.forEach((stock) => {
          if (idSet.has(stock.produitFini.id)) {
            hasDuplicates = true;
          } else {
            idSet.add(stock.produitFini.id);
            ListIdProduitFini.push(stock.produitFini.id);
          }
        });
        
        if (hasDuplicates) {
          throw new HttpException(errors.DUPLICATION_PRODUIT_FINIS, HttpStatus.BAD_REQUEST);
        } 

        const production = await tx.productions.create({
          data: {
            reference: data.reference,
            dateDebut: dateDebut,
            description: data.description,
            dateFin: dateFin,
            coutTotalProduction: data.coutTotalProduction,
            beneficeDetails: data.beneficeDetails,
            beneficeGros: data.beneficeGros,
            stockProdFini: {
              create: data.stockProdFini.map((stock) => ({
                reference: stock.reference,
                pu_gros: stock.pu_gros,
                pu_detail: stock.pu_detail,
                qt_produit: stock.qt_produit,
                datePeremption: new Date(stock.datePeremption),
                produitFini: {
                  connect: {
                    id: stock.produitFini.id,
                  },
                },
                magasin: {
                  connect: {
                    id: stock.magasin.id,
                  },
                },
              })),
            },
            productionLigneAchat: {
              create: data.productionLigneAchat.map((ligne) => ({
                qt_Utilise: ligne.qt_Utilise,
                ligneAchat: {
                  connect: {
                    id: ligne.id,
                  },
                },
              })),
            },
            coutProduction:{
              create: data.coutProduction.map((cout) => ({
                libelle: cout.libelle,
                montant: cout.montant,
                motif: cout.motif,
              })),
            }
          },
          select: {
            id: true,
            numero: true,
            reference: true,
            description: true,
            dateDebut: true,
            dateFin: true,
            createdAt: true,
            updatedAt: true,
            stockProdFini: {
              select: {
                id: true,
                reference: true,
                numero: true,
                pu_gros: true,
                pu_detail: true,
                datePeremption: true,
                qt_produit: true,
                produitFini: {
                  select: {
                    id: true,
                    designation: true,
                    description: true,
                    createdAt: true,
                    unite: {
                      select: {
                        id: true,
                        libelle: true
                      }
                    }
                  }
                },
                magasin: {
                  select: {
                    id: true,
                    nom: true
                  }
                }
              }
            },
            productionLigneAchat: {
              select: {
                id: true,
                qt_Utilise: true,
                createdAt: true,
                productionId: true,
                ligneAchat: {
                  select: {
                    id: true,
                    numero: true,
                    createdAt: true,
                    updatedAt: true,
                    datePeremption: true,
                    magasin: {
                      select: {
                        id: true,
                        nom: true
                      }
                    },
                    prixUnitaire: true,
                    quantite: true,
                    quantiteLivre: true,
                    matiere: {
                      select: {
                        id: true,
                        designation: true
                      }
                    },
                    references: true // Ajout du select pour la propriété references
                  }
                }
              }
            },
            coutProduction: {
              select: {
                id: true,
                libelle: true,
                montant: true,
                motif: true
              }
            }
          }
        });

        data.productionLigneAchat.forEach(async (ligne) => {
          const check = await this.db.ligneAchat.findUnique(
            { 
            where:  {id: ligne.id }, 
            select: {id: true, prixUnitaire: true, quantite: true, datePeremption: true, references: true,
            quantiteLivre: true, qt_Utilise: true, matiereId: true, magasinId: true, createdAt: true, updatedAt: true} })

          const ligneUpdate = await this.db.ligneAchat.update({
            where: { id: check.id },
            data: {
                prixUnitaire: check.prixUnitaire,
                quantite: check.quantite,
                datePeremption: new Date(check.datePeremption),
                references: check.references,
                quantiteLivre: check.quantiteLivre,
                qt_Utilise: check.qt_Utilise + ligne.qt_Utilise ,
                matiere: {
                    connect: {
                        id: check.matiereId,
                    },
                },
                magasin: {
                    connect: {
                        id: check.magasinId,
                    },
                },
            },
        })
        })
      
        const description = `Ajout du produit fini: ${data.description}`;
        this.trace.logger({ action: 'Ajout', description, userId }).then((res) => console.log('TRACE SAVED: ', res));
    
        return production;
      } catch (error: any) {
        console.log(error);
        if (error.status) throw new HttpException(error.message, error.status);
        else 
        throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.BAD_REQUEST);
      }
    });
    }

    findById = async (id: string): Promise<ProductionsReturn> => {
      const production = await this.db.productions.findUnique({
          where: { id },
          include: {
            stockProdFini: {
              include: {
                produitFini: {
                  include: {
                    unite: true
                  }
                },
                magasin: true,
              },
            },
            productionLigneAchat: {
              include: {
                ligneAchat: {
                  include: {
                    matiere: true,
                    magasin: true,
                    achat: true,
                  },
                },
              },
            },
            coutProduction: true
          },
      })
      if (production === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
      return production
     }

    update = async (id: string, data: ProdUpdate, userId: string): Promise<ProdReturn> => {
      console.log('Data received in update method:', JSON.stringify(data, null, 2));
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.productions.findUnique({ where: { id: id }, select: { reference: true, description: true, stockProdFini: true, productionLigneAchat: true, coutProduction: true } })
                if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

                const checkFirst = await tx.productions.findFirst({
                    where: {
                        id: {
                            not: id
                        },
                        reference: {
                            equals: data.reference,
                            mode: 'insensitive'
                        }
                    } 
                })
                if (checkFirst !== null && checkFirst.reference !== check.reference) throw new HttpException(errors.REFERENCE_ALREADY_EXIST, HttpStatus.BAD_REQUEST);

                let productionOld = check;
                
                const dateDebut = new Date(data.dateDebut);
                const dateFin = new Date(data.dateFin);
                
                if (dateDebut > dateFin) {
                  throw new HttpException(errors.DATE_DEBUT_MUST_BE_BEFORE_DATE_FIN, HttpStatus.BAD_REQUEST);
                }
             //NOUS ALLONS VERIFIER S'IL Y A PAS DUPLICATION DE PRODUIT FINIS

                let ListIdProduitFini: string[] = [];
                let idSet = new Set<string>();
                let hasDuplicates = false;
                
                data.stockProdFini.forEach((stock) => {
                  if (stock.produitFini.id && stock.produitFini.id !== null && stock.produitFini.id !== undefined && idSet.has(stock.produitFini.id)) {
                    hasDuplicates = true;
                  } else {
                    idSet.add(stock.produitFini.id);
                    ListIdProduitFini.push(stock.produitFini.id);
                  }
                });
              
                if (hasDuplicates) {
                  throw new HttpException(errors.DUPLICATION_PRODUIT_FINIS, HttpStatus.BAD_REQUEST);
                } 
                const productions = await tx.productions.update({
                    where: { id: id },
                    data: {
                      reference: data.reference,
                      dateDebut: dateDebut,
                      description: data.description,
                      dateFin: dateFin,   
                      stockProdFini: {
                        create: data.stockProdFini.map((stock) => ({
                          reference: stock.reference,
                          pu_gros: stock.pu_gros,
                          pu_detail: stock.pu_detail,
                          qt_produit: stock.qt_produit,
                          datePeremption: new Date(stock.datePeremption),
                          produitFini: {
                            connect: {
                              id: stock.produitFini.id,
                            },
                          },
                          magasin: {
                            connect: {
                              id: stock.magasin.id,
                            },
                          },
                        })),
                      },
                      productionLigneAchat: {
                        create: data.productionLigneAchat.map((ligne) => ({
                          qt_Utilise: ligne.qt_Utilise,
                          ligneAchat: {
                            connect: {
                              id: ligne.id,
                            },
                          },
                        })),
                      },
                      coutProduction: {
                        create: data.coutProduction.map((cout) => ({
                          libelle: cout.libelle,
                          montant: cout.montant,
                          motif: cout.motif
                        })),
                      }
                    },
                    include: {
                      stockProdFini: {
                        include: {
                          produitFini: true,
                          magasin: true,
                        },
                      },
                      productionLigneAchat: {
                        include: {
                          ligneAchat: {
                            include: {
                              matiere: true,
                              magasin: true,
                            },
                          },
                        },
                      },
                      coutProduction: {
                        select: {
                          id: true,
                          libelle: true,
                          montant: true,
                          motif: true
                        }
                      }
                    },
                })

              //========= Supprimer les anciennes lignes d'achat, coûts et paiements ============
              await Promise.all([
                ...productionOld.stockProdFini.map((l) => this.db.stockProduiFini.delete({ where: { id: l.id } })),
                ...productionOld.productionLigneAchat.map((c) => this.db.productionLigneAchat.delete({ where: { id: c.id } })),
                ...productionOld.coutProduction.map((p) => this.db.coutProduction.delete({ where: { id: p.id } })),
              ]);

              // Filtrer et supprimer les entités supprimées avant de retourner la production
              productions.stockProdFini = productions.stockProdFini.filter(stock =>
                !check.stockProdFini.some(oldStock => oldStock.id === stock.id)
              );
              productions.productionLigneAchat = productions.productionLigneAchat.filter(ligne =>
                  !check.productionLigneAchat.some(oldLigne => oldLigne.id === ligne.id)
              );
              productions.coutProduction = productions.coutProduction.filter(cout =>  
                !check.coutProduction.some(oldCout => oldCout.id === cout.id)
              );
              
               // Vérifiez les lignes d'achat existantes avant de mettre à jour
                    const existingLignes = await Promise.all([
                      ...data.productionLigneAchat.map(ligne => tx.ligneAchat.findUnique({
                        where: { id: ligne.id }
                      })),
                      ...check.productionLigneAchat.map(oldLigne => tx.ligneAchat.findUnique({
                        where: { id: oldLigne.ligneAchatId }
                      }))
                    ]);

                    // Filtrer les lignes trouvées pour éviter les erreurs lors de la mise à jour
                    const validProductionLigneAchat = data.productionLigneAchat.filter(ligne =>
                      existingLignes.some(e => e?.id === ligne.id)
                    );

                    const validCheckProductionLigneAchat = check.productionLigneAchat.filter(oldLigne =>
                      existingLignes.some(e => e?.id === oldLigne.ligneAchatId)
                    );

                    console.log("ICI NOUS METONS À JOURS LES LIGNES D'ACHAT DE LA PRODUCTION GENRE AUGMENTER LA QUANTITÉ UTILISÉE");
                    console.log(validProductionLigneAchat);

                    console.log(check.productionLigneAchat);

                    await Promise.all([
                      // Mise à jour des nouvelles lignes d'achat en augmentant la quantité utilisée
                      ...validProductionLigneAchat.map(async (ligne) => {
                        console.log("Augmentation de la quantité utilisée pour la ligne d'achat :", ligne);
                        return tx.ligneAchat.update({
                          where: { id: ligne.id },
                          data: {
                            qt_Utilise: { increment: ligne.qt_Utilise ?? 0 }
                          }
                        });
                      }),
                      // Mise à jour des anciennes lignes d'achat en diminuant la quantité utilisée
                      ...validCheckProductionLigneAchat.map(async (oldLigne) => {
                        console.log("Diminution de la quantité utilisée pour la ligne d'achat :", oldLigne);
                        return tx.ligneAchat.update({
                          where: { id: oldLigne.ligneAchatId },
                          data: {
                            qt_Utilise: { decrement: oldLigne.qt_Utilise ?? 0 }
                          }
                        });
                      })
                    ]);

        
                const description = `Modification du production: ${check.description} -> ${data.description}`
                this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))
                return productions
            } catch (error: any) {
              console.log("ERROR: ", error);
              
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    archive = async (id: string, userId: string): Promise<ProdReturn> => {
      const check = await this.db.productions.findUnique({ where: { id: id }, select: { description: true, archive: true } })
      if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

      const magasin = await this.db.productions.update({
          where: { id },
          data: {
              archive: !check.archive
          },
          select: { id: true }
      })

      const description = `Archivage d'une production: ${check.description}`
      this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

      return magasin
    }

    remove = async (id: string, userId: string): Promise<ProdReturn> => {
      const check = await this.db.productions.findUnique({ where: { id: id }, select: { description: true, removed: true } })
      if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

      const magasin = await this.db.productions.update({
          where: { id },
          data: {
              removed: !check.removed
          },
          select: { id: true }
      })

      const description = `Suppression logique d'une production: ${check.description}`
      this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


      return magasin
    }

    destroy = async (id: string, userId: string): Promise<ProdReturn> => {
      const check = await this.db.productions.findUnique({ where: { id: id }, select: { description: true } })
      if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

      try {
          const magasin = await this.db.productions.delete({
              where: { id },
              select: { id: true }
          })

          const description = `Suppression physique du magasin des produits finis: ${check.description}`
          this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

          return magasin
      } catch (_: any) {
          throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
      }
    }

    listTable = async (filter: ProductionFetcher, query: PaginationQuery): Promise<Pagination<tableReturn>> => {
      let conditions = {}
      const limit = query.size ? query.size : 10;
      const offset = query.page ? (query.page - 1) * limit : 0;

      // let filters = { }
      if (filter.debut) {
          conditions = {
              ...conditions,
              designation: {
                  contains: filter.debut,
                  mode: "insensitive"
              }
          }
      }

      if (filter.debut || filter.fin) {
          let dateFilter = {};
          if (filter.debut) {
              dateFilter = { ...dateFilter, gte: new Date(filter.debut) };
          }
          if (filter.fin) {
              dateFilter = { ...dateFilter, lte: new Date(filter.fin) };
          }
          conditions = { ...conditions, createdAt: dateFilter };
      }
      conditions = { ...conditions, removed: filter.removed, archive: filter.archive }

      let order = {}
      if (query.orderBy) {
          order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
      }


      const production = await this.db.productions.findMany({
          take: limit,
          skip: offset,
          where: conditions,
          include: {
            stockProdFini: {
              include: {
                produitFini: true,
                magasin: true,
              },
            },
            productionLigneAchat: {
              include: {
                ligneAchat: {
                  include: {
                    matiere: true,
                    magasin: true,
                    achat: {
                      include: {
                        couts: {
                          select: {
                            montant: true
                          }
                        },
                      }
                    }
                  },
                },
              },
            },
            coutProduction: true
          },
          orderBy: order
      })

      let tableContent: tableReturn[] = [];
      let i = 0;
      production.forEach(element => {

        let nameProFini: string[] = [];

        element.stockProdFini.forEach((element) => {
          nameProFini.push(element.produitFini.designation);
      });
      
        let montantPrixAchatMatierePremiere: number = 0;
        let coutAchatMatirePremiere: number = 0;
        
        for (const elements of element.productionLigneAchat) {

          const tva = elements.ligneAchat.achat.tva ?? 0;
          // Calcul avec TVA
          montantPrixAchatMatierePremiere += (elements.ligneAchat.prixUnitaire * elements.ligneAchat.quantite) * (1 + (tva / 100));
        
            elements.ligneAchat.achat.couts.forEach((cout) => {
                coutAchatMatirePremiere += cout.montant;
            });
        }
        
        let montantChargeOuCoutProduction: number = 0;

        element.coutProduction.forEach((element) => {
            montantChargeOuCoutProduction += element.montant;
        });
      
        tableContent.push({
          id: element.id,
          numero: i += 1,
          reference: element.reference,
          produiFini: nameProFini,
          description: element.description,
          dateDebut: element.dateDebut,
          dateFin: element.dateFin,
          coutTotal : montantPrixAchatMatierePremiere + montantChargeOuCoutProduction + coutAchatMatirePremiere
        })

      });
      

      const totalCount = await this.db.productions.count({ where: conditions });

      const totalPages = Math.ceil(totalCount / limit);
      const pagination: Pagination<tableReturn> = {
          data: tableContent,
          totalPages,
          totalCount,
          currentPage: query.page ? query.page : 1,
          size: limit
      }

      return pagination
    }


}