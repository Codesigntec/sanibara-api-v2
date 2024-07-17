import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { ProdReturn, ProdSave, Productions, ProductionsReturn, ProductionsSaver } from "./production.type";
import { errors } from "./production.constant";


@Injectable()
export class ProductionService {
    
    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }


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
          if (check !== null) throw new HttpException('REFERENCE_ALREADY_EXIST', HttpStatus.BAD_REQUEST);
  
          if (!data.reference || !data.dateDebut || !data.dateFin) {
            throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
          }
  
          const production = await tx.productions.create({
            data: {
              reference: data.reference,
              dateDebut: new Date(data.dateDebut),
              description: data.description,
              dateFin: new Date(data.dateFin),
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
          console.log('ERROR: ', error);
  
          if (error.status) throw new HttpException(error.message, error.status);
          else throw new HttpException('UNKNOWN_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    }
}