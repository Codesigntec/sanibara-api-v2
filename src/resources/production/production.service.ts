import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { ProdReturn, ProdSave, ProductionFetcher, Productions, ProductionsReturn, ProductionsSaver } from "./production.type";
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
                  },
                },
              },
            },
          },
          orderBy: order
      })

      const totalCount = await this.db.produitFini.count({ where: conditions });

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






    async save(data: ProdSave, userId: string): Promise<ProdReturn> {
      console.log('Service Data:', data);  // Ajoutez cette ligne pour vérifier ce que le service reçoit
  
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
  
          const production = await tx.productions.create({
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
                  ligneAchat: {
                    connect: {
                      id: ligne.id,
                    },
                  },
                })),
              },
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
              }
            }
          });
  
          const description = `Ajout du produit fini: ${data.description}`;
          this.trace.logger({ action: 'Ajout', description, userId }).then((res) => console.log('TRACE SAVED: ', res));
  
          return production;
        } catch (error: any) {
          if (error.status) throw new HttpException(error.message, error.status);
          else 
          throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.BAD_REQUEST);
        }
      });
    }
}