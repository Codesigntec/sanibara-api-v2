import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Etat, PrismaClient, StatutAchat } from '@prisma/client';
import { TraceService } from '../trace/trace.service';
import { Achat, AchatFetcher, AchatFull, AchatSaver, } from './achat.types';
import { Pagination, PaginationQuery } from 'src/common/types';
import { errors } from './achat.constant';

@Injectable()
export class AchatService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: AchatFetcher, query: PaginationQuery): Promise<Pagination<AchatFull>> => {
        const conditions = { ...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }
            const achats = await this.db.achat.findMany({
                take: limit,
                skip: offset,
                where: conditions,
                select: {
                    id: true,
                    numero: true,
                    libelle: true,
                    date: true,
                    tva: true,
                    statutAchat: true,
                    etat: true,
                    ligneAchats: {
                      select:{
                        id: true,
                        references: true,
                        prixUnitaire: true,
                        quantite: true,
                        datePeremption: true,
                        matiere: true,
                        magasin: true,
                        createdAt: true,
                        updatedAt: true,
                      }
                    },
                    fournisseur: {
                      select: {
                        id: true,
                        nom: true,
                      }
                    },
                    couts: {
                      select:{
                        id: true,
                        libelle: true,
                        montant: true,
                        motif: true,
                      }
                    },
                    paiements: {
                      select:{
                        id: true,
                        montant: true,
                      }
                    },
                    updatedAt: true,
                    createdAt: true,
                },
                orderBy: order,
            });
        const totalCount = await this.db.achat.count({ where: conditions });
        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<AchatFull> = {

            data: achats,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }
        return pagination
    }

    //==============================SAVE====================================

     saveAchat = async (data: AchatSaver, userId: string): Promise<Achat> => {

      for (const ligne of data.ligneAchats) {
        if (!ligne.matiere || !ligne.matiere.id) {
          console.log("Invalid or missing 'matiere'", ligne.matiere);
            throw new Error("Invalid or missing 'matiere'");
        }
        if (!ligne.magasin || !ligne.magasin.id) {
          console.log("Invalid or missing 'magasin'", ligne.magasin);
            throw new Error("Invalid or missing 'magasin'");
        }
      }

      for(const cout of data.couts) {
        if (!cout.montant) {
          console.log("Invalid or missing 'cout.montant'", cout.montant);
            throw new Error("Invalid or missing 'cout.montant'");
        }
      }

      for(const paiement of data.paiements) {
        if (!paiement.montant) {
          console.log("Invalid or missing 'paiement.montant'", paiement.montant);
            throw new Error("Invalid or missing 'paiement.montant'");
        }
      }

        const fournisseurData = data.fournisseur ? {
          connect: {
              id: data.fournisseur.id,
          },
        } : undefined;
      
        const achat = await this.db.achat.create({
          data: {
            libelle: data.libelle,
            date: new Date(data.date),
            statutAchat: data.statutAchat,
            etat: data.etat,
            tva: data.tva,
            fournisseur: fournisseurData,
            ligneAchats: {
              create: data.ligneAchats.map((ligne) => ({
                prixUnitaire: ligne.prixUnitaire,
                quantite: ligne.quantite,
                datePeremption: new Date(ligne.datePeremption),
                references: ligne.references,
                matiere: {
                  connect: {
                    id: ligne.matiere.id,
                  },
                },
                magasin: {
                  connect: {
                    id: ligne.magasin.id,
                  },
                },
              })),
            },
            couts: {
              create: data.couts.map((cout) => ({
                libelle: cout.libelle,
                montant: cout.montant,
                motif: cout.motif,
              })),
            },
            paiements: {
              create: data.paiements.map((paiement) => ({
                montant: paiement.montant,
              })),
            },
          },
          //=========SELECT================
          select: {
            id: true,
            libelle: true,
            numero: true,
            createdAt: true,
          },
        });
      
        const description = `Ajout de l'achat: ${data.libelle}`;
        this.trace.logger({ action: 'Ajout', description, userId }).then((res) => console.log('TRACE SAVED: ', res));
      
        return achat;
      };


      //==============================UPDATE====================================

      update = async (achatId: string, data: AchatSaver, userId: string): Promise<Achat> => {

        const check = await this.db.achat.findUnique({ where: { id: achatId }, select: { 
          libelle: true ,
          ligneAchats: {
            select:{
              id: true,
            }
          },
          couts: {
            select:{
              id: true,
            }
          },
          paiements: {
            select:{
              id: true,
            }
          },

        } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

      let ach = check;

        // Validation des données similaires à saveAchat
        for (const ligne of data.ligneAchats) {
          if (!ligne.matiere || !ligne.matiere.id) {
            console.log("Invalid or missing 'matiere'", ligne.matiere);
            throw new Error("Invalid or missing 'matiere'");
          }
          if (!ligne.magasin || !ligne.magasin.id) {
            console.log("Invalid or missing 'magasin'", ligne.magasin);
            throw new Error("Invalid or missing 'magasin'");
          }
        }
      
        for(const cout of data.couts) {
          if (!cout.montant) {
            console.log("Invalid or missing 'cout.montant'", cout.montant);
            throw new Error("Invalid or missing 'cout.montant'");
          }
        }
      
        for(const paiement of data.paiements) {
          if (!paiement.montant) {
            console.log("Invalid or missing 'paiement.montant'", paiement.montant);
            throw new Error("Invalid or missing 'paiement.montant'");
          }
        }

        const fournisseurData = data.fournisseur ? {
          connect: {
            id: data.fournisseur.id,
          },
        } : undefined;


        // Mettre à jour l'achat avec les nouvelles données
        const achat = await this.db.achat.update({
          where: {
            id: achatId,
          },
          data: {
            libelle: data.libelle,
            date: new Date(data.date),
            statutAchat: data.statutAchat,
            etat: data.etat,
            tva: data.tva,
            fournisseur: fournisseurData,
            ligneAchats: {
              create: data.ligneAchats.map((ligne) => ({
                prixUnitaire: ligne.prixUnitaire,
                quantite: ligne.quantite,
                datePeremption: new Date(ligne.datePeremption),
                references: ligne.references,
                matiere: {
                  connect: {
                    id: ligne.matiere.id,
                  },
                },
                magasin: {
                  connect: {
                    id: ligne.magasin.id,
                  },
                },
              })),
            },
            couts: {
              create: data.couts.map((cout) => ({
                libelle: cout.libelle,
                montant: cout.montant,
                motif: cout.motif,
              })),
            },
            paiements: {
              create: data.paiements.map((paiement) => ({
                montant: paiement.montant,
              })),
            },
          },
          select: {
            id: true,
            libelle: true,
            numero: true,
            createdAt: true,
          },
        });

          //========= Supprimer les anciennes lignes d'achat, coûts et paiements ============
          ach.ligneAchats.map((l) => this.db.ligneAchat.delete({ where: { id: l.id } }));
          ach.couts.map((c) => this.db.cout.delete({ where: { id: c.id } }));
          ach.paiements.map((p) => this.db.paiement.delete({ where: { id: p.id } }));

      console.log("===========================Achat============================");
      console.log(ach);
      
      
        const description = `Mise à jour de l'achat: ${data.libelle}`;
        this.trace.logger({ action: 'Mise à jour', description, userId }).then((res) => console.log('TRACE SAVED: ', res));
      
        return achat;
      };
      


      //============================ARCHIVER==============================
      archive = async (id: string, userId: string): Promise<Achat> => {
        const check = await this.db.achat.findUnique({ where: { id: id }, select: { libelle: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const achat = await this.db.achat.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: {
                id: true,
                numero: true,
                libelle: true,
                createdAt: true,
            }
        })

        const description = `Archivage de l'achat: ${check.libelle}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return achat 
    }

//=============================REMOVE====================================

      remove = async (id: string, userId: string): Promise<Achat> => {
        const check = await this.db.achat.findUnique({ where: { id: id }, select: { libelle: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const achat = await this.db.achat.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: {
                id: true,
                numero: true,
                libelle: true,
                createdAt: true,
            }
        })

        const description = `Suppression logique de l'achat: ${check.libelle}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return achat
    }
    //=============================DESTROY====================================

      destroy = async (id: string, userId: string): Promise<Achat> => {
        const check = await this.db.achat.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const depense = await this.db.achat.delete({
                where: { id },
                select: {
                  id: true,
                  numero: true,
                  libelle: true,
                  createdAt: true,
                }
            })

            const description = `Suppression physique de l'achat: ${check.libelle}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return depense
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }



}
