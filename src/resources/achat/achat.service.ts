import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cout, Etat, LigneAchat, PrismaClient, StatutAchat } from '@prisma/client';
import { TraceService } from '../trace/trace.service';
import { Achat, AchatFetcher, AchatFull, AchatReturn, AchatSaver, CoutSaver, LigneAchatByStore, LigneAchatFull, LigneAchatSave,
   LigneAchatSelect, ligneLivraison, Livraison, Paiement, PaiementFull, PaiementSave,
   StockMatiereFetcher, } from './achat.types';
import { Pagination, PaginationQuery } from 'src/common/types';
import { errors } from './achat.constant';

@Injectable()
export class AchatService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

   
    findById = async (id: string): Promise<AchatFull> => {
      return await this.db.achat.findUnique({
          where: { id },
          select: {
              id: true,
              numero: true,
              libelle: true,
              date: true,
              tva: true,
              statutAchat: true,
              etat: true,
              ligneAchats: {
                  select: {
                      id: true,
                      references: true,
                      prixUnitaire: true,
                      quantiteLivre: true,
                      qt_Utilise: true,
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
                  select: {
                      id: true,
                      libelle: true,
                      montant: true,
                      motif: true,
                  }
              },
              paiements: {
                  select: {
                      id: true,
                      montant: true,
                      createdAt: true,
                  }
              },
              updatedAt: true,
              createdAt: true,
          },
      });
  }
  
    list = async (filter: AchatFetcher, statutAchat: string, query: PaginationQuery): Promise<Pagination<AchatReturn>> => {
        let conditions = {...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        // Correction du filtrage par statut
        if (statutAchat === 'ACHETER' || statutAchat === 'COMMANDE') {
              conditions.statutAchat = statutAchat;
         }
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
                        quantiteLivre: true,
                        qt_Utilise: true,
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
                        createdAt: true,
                      }
                    },
                    updatedAt: true,
                    createdAt: true,
                },
                orderBy: order,
            });
    
            let AchatReturn: AchatReturn[] = []

              for (const achat of achats) {
                // Trouver toutes les lignes d'achat liées à cet achat
                const ligneAchats = await this.db.ligneAchat.findMany({
                  where: {
                    achatId: achat.id,
                  },
                  select: {
                    id: true,
                    qt_Utilise: true
                  },
                });
                const estLieAProduction = ligneAchats.some((ligneAchat) => ligneAchat.qt_Utilise > 0);
                if (estLieAProduction) {
                  AchatReturn.push({ ...achat, hasProductionLink: true});
                }else{
                  AchatReturn.push({ ...achat, hasProductionLink: false});
                }
              }

            const totalCount = await this.db.achat.count({ where: conditions });
            const totalPages = Math.ceil(totalCount / limit);
            const pagination: Pagination<AchatReturn> = {
            data: AchatReturn,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }
        return pagination
    }
    //==============================SAVE====================================
     saveAchat = async (data: AchatSaver, userId: string): Promise<Achat> => {
      console.log("DATA", data);
      
      for (const ligne of data.ligneAchats) {
        if (!ligne.matiere || !ligne.matiere.id) {
          throw new HttpException(errors.MATIERE_INVALID, HttpStatus.BAD_REQUEST);
        }
        if (!ligne.magasin || !ligne.magasin.id) {
          throw new HttpException(errors.MAGASIN_INVALID, HttpStatus.BAD_REQUEST);
        }
      }
        const fournisseurData = data.fournisseur.id ? {
          connect: {
            id: data.fournisseur.id,
          },
        } : undefined;

        // if (data.libelle === null || data.libelle === undefined || data.libelle === '') {
        //   throw new HttpException(errors.LIBELLE_INVALID, HttpStatus.BAD_REQUEST);
        // }
    
        let dateAchat: Date;
        if (data.date === null || data.date === undefined || data.date === '') {
          dateAchat = new Date();
        } else {
          dateAchat = new Date(data.date);
        }
        // Calcul du montant total des matières premières
        const totalMatieresPremieres = data.ligneAchats.reduce((acc, ligne) => {
          const prixTotal = ligne.prixUnitaire * ligne.quantite;
          return acc + prixTotal;
        }, 0);

        // Calcul du montant total des coûts
        const totalCouts = data.couts.reduce((acc, cout) => acc + cout.montant, 0);

        // Calcul du montant de la TVA en fonction du taux
        let montantTVA: number ;
        if (data.tva != null) {
          montantTVA = (data.tva / 100) * totalMatieresPremieres;
        }
        // Ajout du montant total des matières premières au montant total de l'achat
        const totalAchat = totalMatieresPremieres + (totalCouts ?? 0) + (montantTVA ?? 0);

        // Calcul du montant total des paiements
        const totalPaiements = data.paiements.reduce((acc, paiement) => acc +  Number(paiement.montant) == null || Number(paiement.montant) == undefined ? 0 : Number(paiement.montant), 0);
        // Vérification si les paiements dépassent le montant total de l'achat
        if (totalPaiements > totalAchat) {
          throw new HttpException(errors.MONTANT_DEPASSE_MONTANT_A_PAYE, HttpStatus.BAD_REQUEST);
        }
       let libelle: string = '';

       if (!data.libelle) {
        const action = data.statutAchat === StatutAchat.ACHETER ? 'Achat' : 'Commande';
        libelle = `${action} du ${new Date(dateAchat).toLocaleDateString()}`;
      } else {
        libelle = data.libelle;
      }
      
        const achat = await this.db.achat.create({
          data: {
            libelle: libelle,
            date: dateAchat,
            statutAchat: data.statutAchat,
            etat: data.etat,
            createdAt: new Date(),
            tva: data.tva,
            fournisseur: fournisseurData,
            ligneAchats: {
              create: data.ligneAchats.map((ligne) => ({
                prixUnitaire: ligne.prixUnitaire,
                quantite: ligne.quantite,
                qt_Utilise: 0,
                // quantiteLivre: StatutAchat.ACHETER === data.statutAchat ? ligne.quantite: 0,
                quantiteLivre: data.statutAchat === StatutAchat.COMMANDE ? ligne.quantiteLivre : ligne.quantite,
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
                montant: Number(paiement.montant) == null || Number(paiement.montant) == undefined ? 0 : Number(paiement.montant),
              })),
            },
          },
          //=================SELECT================
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

  // Start transaction
  const achat = await this.db.$transaction(async (tx) => {
      // Fetch existing achat and relations
      const check = await tx.achat.findUnique({
          where: { id: achatId },
          select: {
              libelle: true,
              ligneAchats: { select: { id: true } },
              couts: { select: { id: true } },
              paiements: { select: { id: true, montant: true } },
          },
      });

      if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

      const fournisseurData = data.fournisseur.id ? {
          connect: { id: data.fournisseur.id },
      } : undefined;

      // Calculate totals
      const totalMatieresPremieres = data.ligneAchats.reduce((acc, ligne) => acc + (ligne.prixUnitaire * ligne.quantite), 0);
      const totalCouts = data.couts.reduce((acc, cout) => acc + cout.montant, 0);
      const montantTVA = data.tva ? (data.tva / 100) * totalMatieresPremieres : 0;
      const totalAchat = totalMatieresPremieres + (totalCouts ?? 0) + (montantTVA ?? 0);
      const totalPaiements = data.paiements.reduce((acc, paiement) => acc + paiement.montant, 0);

      if (totalPaiements > totalAchat) {
          throw new HttpException(errors.INVALID_PAIEMENT, HttpStatus.BAD_REQUEST);
      }

      const ligneAchats = await tx.ligneAchat.findMany({
          where: { achatId: achatId },
          select: { id: true, qt_Utilise: true },
      });
      const estLieAProduction = ligneAchats.some((ligneAchat) => ligneAchat.qt_Utilise > 0);

      let ligneA = {};
      if (!estLieAProduction) {
          ligneA = {
              create: data.ligneAchats.map((ligne) => ({
                  prixUnitaire: ligne.prixUnitaire,
                  // quantiteLivre: ligne.quantiteLivre,
                  quantiteLivre: data.statutAchat === StatutAchat.COMMANDE ? ligne.quantiteLivre : ligne.quantite,
                  quantite: ligne.quantite,
                  datePeremption: new Date(ligne.datePeremption),
                  references: ligne.references,
                  matiere: { connect: { id: ligne.matiere.id } },
                  magasin: { connect: { id: ligne.magasin.id } },
              })),
          };
       }else{
          ligneA = {
              update: data.ligneAchats.map((ligne) => ({
                  where: { id: ligne.id },
                  data: {
                      // quantiteLivre: ligne.quantiteLivre,
                      quantiteLivre: data.statutAchat === StatutAchat.COMMANDE ? ligne.quantiteLivre : ligne.quantite,
                      quantite: ligne.quantite,
                      datePeremption: new Date(ligne.datePeremption),
                      references: ligne.references,
                      matiere: { connect: { id: ligne.matiere.id } },
                      magasin: { connect: { id: ligne.magasin.id } },
                  },
              })),
          };
      }
     
      let coutDAchat: any;

      coutDAchat = {
        create: data.couts.map((cout) => ({
          montant: cout.montant,
          libelle: cout.libelle,
          motif: cout.motif,
        }))
      };
      
      let paiementAchat = {};

      if (check.paiements.length === 0) {
        paiementAchat ={
          create: data.paiements.map((paiement) => ({
            create: {
              montant: paiement.montant,
            },
          }))
        }
      }else{
        paiementAchat = {
          update: {
            where: { id: check.paiements[0].id },
            data: { montant: data.paiements[0].montant },
          },
          create: data.paiements.filter((paiement) => !paiement.id).map((paiement) => ({
            montant: paiement.montant,
          })),
        }        
      }
      
      // Update achat
      const updatedAchat = await tx.achat.update({
          where: { id: achatId },
          data: {
              libelle: data.libelle,
              date: new Date(data.date),
              statutAchat: data.statutAchat,
              etat: data.etat,
              updatedAt: new Date(),
              tva: data.tva,
              fournisseur: fournisseurData,
              ligneAchats: ligneA,
              couts: coutDAchat,
              // paiements: paiementAchat,
          },
          select: {
              id: true,
              libelle: true,
              numero: true,
              createdAt: true,
          },
      });

      if (!estLieAProduction) {
          await Promise.all([
              ...check.ligneAchats.map((l) => tx.ligneAchat.delete({ where: { id: l.id } })),
             ...check.couts.map((c) => tx.cout.delete({ where: { id: c.id } })),
          ]);
      }
      await Promise.all(
          check.paiements
              .filter((p) => p.montant <= 0)
              .map((p) => tx.paiement.delete({ where: { id: p.id } })),
      );
      const description = `Mise à jour de l'achat: ${data.libelle}`;
      await this.trace.logger({ action: 'Mise à jour', description, userId }).then((res) => console.log('TRACE SAVED: ', res));

      return updatedAchat;
  });

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

    remove = async (id: string, userId: string, etat: string): Promise<Achat> => {

        const check = await this.db.achat.findUnique({ where: { id: id }, select: { libelle: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
       
        const newRemovedState = !check.removed;

        const achat = await this.db.achat.update({
            where: { id },
            data: {
                removed: newRemovedState
            },
            select: {
                id: true,
                numero: true,
                libelle: true,
                ligneAchats: true,
                createdAt: true,
            }
        })


        if (etat === 'true') {

          const ligneAchats = await this.db.ligneAchat.findMany({
            where: {
              achatId: achat.id,
            },
            select: {
              id: true,
              productionLigneAchat: {
                select: {
                  id: true, 
                },
              },
            },
          });

          const listIdProduction: string[] = []
        
          ligneAchats.forEach(async (l) => {
            l.productionLigneAchat.forEach(async (pl) => {
              listIdProduction.push(pl.id)
            })
          })


          



          // Mettre à jour les ventes liées aux stockVente
          // await this.db.vente.updateMany({
          //   where: {
          //     stockVente: {
          //       some: {
          //         stockProduiFiniId: { in: stockIds }
          //       }
          //     }
          //   },
          //   data: {
          //     removed: newRemovedState
          //   }
          // });
        }

        const description = `Suppression logique de l'achat: ${check.libelle}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return achat
    }
    //=============================DESTROY====================================

      destroy = async (id: string, userId: string): Promise<Achat> => {
        const check = await this.db.achat.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST_ACHAT, HttpStatus.BAD_REQUEST);

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
            throw new HttpException(errors.NOT_REMOVABLE_ACHAT, HttpStatus.BAD_REQUEST);
        }
    }

      //=============================================PAIEMENT===========================================

      // Méthode pour ajouter un paiement à un achat existant
      savePaiementToAchat = async (achatId: string, paiement: PaiementSave, userId: string): Promise<PaiementFull> => {
        // Récupérer l'achat existant par son ID avec les paiements associés
        const achat = await this.db.achat.findUnique({
          where: { id: achatId },
          include: { 
            ligneAchats: true, 
            paiements: true,
            couts: true,
          },
        });

        if (!achat) {
          throw new HttpException(errors.ACHAT_NOT_EXIST, HttpStatus.NOT_FOUND);
        }

        // Calculer le montant total déjà payé
        const montantTotalPaye = achat.paiements.reduce((acc, p) => acc + p.montant, 0);

        // Calcul du montant total des matières premières
        const totalMatieresPremieres = achat.ligneAchats.reduce((acc, ligne) => {
          const prixTotal = ligne.prixUnitaire * ligne.quantite;
          return acc + prixTotal;
        }, 0);

        // Calcul du montant total des coûts
        const totalCouts = achat.couts.reduce((acc, cout) => acc + cout.montant, 0);

        // Calcul du montant de la TVA en fonction du taux
        let montantTVA: number = 0;
        if (achat.tva != null) {
          montantTVA = (achat.tva / 100) * totalMatieresPremieres;
        }

        // Ajout du montant total des matières premières au montant total de l'achat
        const totalAchat = totalMatieresPremieres + totalCouts + montantTVA;

        // Calculer le reliquat restant à payer
        const reliquat = totalAchat - montantTotalPaye;

        // Vérifier si le paiement proposé ne dépasse pas le reliquat
        if (paiement.montant > reliquat) {
          throw new HttpException(errors.MONTANT_DEPASSE_RELIQUA, HttpStatus.NOT_ACCEPTABLE);
        }

        let newPaiement: PaiementFull;

        await this.db.$transaction(async (tx) => {
          // Ajouter le paiement à l'achat
          newPaiement = await tx.paiement.create({
            data: {
              montant: paiement.montant,
              achat: { connect: { id: achatId } },
            },
          });

          // Mettre à jour l'achat pour refléter le paiement ajouté
          await tx.achat.update({
            where: { id: achatId },
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

        const description = `Paiement de ${paiement.montant} pour l'achat ${achatId}`
        this.trace.logger({action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res));

        return newPaiement;
      };


      updatePaiement = async (id: string, data: PaiementSave, achatId: string ,userId: string): Promise<PaiementFull> => {
      const check = await this.db.paiement.findUnique({ where:  {id: id }, select: { montant: true } })
      if (!check) throw new HttpException(errors.PAIEMENT_NOT_EXIST, HttpStatus.BAD_REQUEST);

         // Récupérer l'achat existant par son ID avec les paiements associés
         const achat = await this.db.achat.findUnique({
          where: { id: achatId },
          include: { 
            ligneAchats: true, 
            paiements: true,
            couts: true,
          },
        });

        if (!achat) {
          throw new HttpException(errors.ACHAT_NOT_EXIST, HttpStatus.NOT_FOUND);
        }

        // Calculer le montant total déjà payé
        const montantTotalPaye = achat.paiements.reduce((acc, p) => acc + p.montant, 0);

        // Calcul du montant total des matières premières
        const totalMatieresPremieres = achat.ligneAchats.reduce((acc, ligne) => {
          const prixTotal = ligne.prixUnitaire * ligne.quantite;
          return acc + prixTotal;
        }, 0);
  
          // Calcul du montant total des coûts
          const totalCouts = achat.couts.reduce((acc, cout) => acc + cout.montant, 0);
  
          // Calcul du montant de la TVA en fonction du taux
          let montantTVA: number ;
          if (achat.tva != null) {
            montantTVA = (achat.tva / 100) * totalMatieresPremieres;
          }
          
        // Ajout du montant total des matières premières au montant total de l'achat
        const totalAchat = totalMatieresPremieres + (totalCouts ?? 0) + (montantTVA ?? 0);
    
        // Calculer le reliquat restant à payer
        const reliquat = (totalAchat ?? 0) - montantTotalPaye;

        // Vérifier si le paiement proposé ne dépasse pas le reliquat
        if (data.montant > reliquat) {
          throw new HttpException(errors.MONTANT_DEPASSE_RELIQUA, HttpStatus.NOT_ACCEPTABLE);
        }

      const paiementSaver = await this.db.paiement.update({
          where: { id },
          data: {
              montant: data.montant
          },
          select: { id: true, montant: true, createdAt: true, updatedAt: true },
      })

      const description = `Modification du paiement: ${check.montant} -> ${data.montant} pour l'achat ${achatId}`
      this.trace.logger({action: 'Modification', description, userId }).then(res=>console.log("TRACE SAVED: ", res))


      return paiementSaver
      }

       //=============================DESTROY====================================

      destroyPaiement = async (id: string, userId: string): Promise<PaiementFull> => {
          const check = await this.db.paiement.findUnique({ where: { id: id }, select: { montant: true } })
          if (!check) throw new HttpException(errors.NOT_EXIST_PAIEMENT, HttpStatus.BAD_REQUEST);
  
          try {
              const paiementsDestroy = await this.db.paiement.delete({
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
      //=============================================COUT====================================================
      // Méthode pour ajouter un cou à un achat existant
      saveCoutToAchat = async (achatId: string, data: CoutSaver, userId: string): Promise<CoutSaver> => {
        // Récupérer l'achat existant par son ID avec les paiements associés
        const achat = await this.db.achat.findUnique({
          where: { id: achatId },
          include: { 
            couts: true,
          },
        });

        if (!achat) {
          throw new HttpException(errors.ACHAT_NOT_EXIST, HttpStatus.NOT_FOUND);
        }

        let newCout: Cout ;

      this.db.$transaction(async (tx) => {

        // Ajouter le paiement à l'achat
        newCout = await this.db.cout.create({
            data: {
              libelle: data.libelle,
              motif: data.motif,
              montant: data.montant,
              achat: { connect: { id: achatId } },
            },
          });
              // Mettre à jour l'achat pour refléter le paiement ajouté
          await this.db.achat.update({
          where: { id: achatId },
          data: {
            couts: {
              connect: { id: newCout.id },
            },
          },
          include: {
            couts: true, // Inclure les couts mis à jour dans la réponse
          },
        });

      });

      const description = `Ajout d'un cout de ${data.montant} pour l'achat ${achatId}`
      this.trace.logger({action: 'Ajout', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

        return newCout;
      };

      updateCout = async (id: string, data: CoutSaver, achatId: string ,userId: string): Promise<CoutSaver> => {
            const check = await this.db.cout.findUnique({ where:  {id: id }, select: { libelle: true ,achatId: true} })
            if (!check) throw new HttpException(errors.PAIEMENT_NOT_EXIST, HttpStatus.BAD_REQUEST);
      
            if (check.achatId !== achatId) {
              throw new HttpException(errors.COUT_ERROR, HttpStatus.BAD_REQUEST);
            }
            const coutSaver = await this.db.cout.update({
                where: { id },
                data: {
                    montant: data.montant,
                    libelle: data.libelle,
                    motif: data.motif,
                    
                },
                select: { id: true, montant: true, libelle: true, motif: true },
            })
      
            const description = `Modification du coût: ${check.libelle} -> ${data.montant} pour l'achat ${achatId}`
            this.trace.logger({action: 'Modification', description, userId }).then(res=>console.log("TRACE SAVED: ", res))
      
      
            return coutSaver
      }
      //=============================DESTROY====================================

      destroyCout = async (id: string, userId: string): Promise<CoutSaver> => {
          const check = await this.db.cout.findUnique({ where: { id: id }, select: { montant: true } })
          if (!check) throw new HttpException(errors.NOT_EXIST_COUT, HttpStatus.BAD_REQUEST);
  
          try {
              const coutDestroy = await this.db.cout.delete({
                  where: { id },
                  select: {
                    id: true,
                    montant: true,
                    libelle: true,
                  }
              })
  
              const description = `Suppression physique du paiement: ${check.montant}`
              this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))
  
              return coutDestroy
          } catch (_: any) {
              throw new HttpException(errors.NOT_REMOVABLE_PAIEMENT, HttpStatus.BAD_REQUEST);
          }
      }
      // Méthode pour ajouter un cou à un achat existant
      saveLigneAchatToAchat = async (achatId: string, data: LigneAchatSave, userId: string): Promise<LigneAchat> => {
        // Récupérer l'achat existant par son ID avec les paiements associés
        const achat = await this.db.achat.findUnique({
          where: { id: achatId },
          include: { 
            ligneAchats: true,
          },
        });

        if (!achat) {
          throw new HttpException(errors.ACHAT_NOT_EXIST, HttpStatus.NOT_FOUND);
        }

        let newLigneAchat: LigneAchat ;

      this.db.$transaction(async (tx) => {

        // Ajouter la ligne achat à l'achat
        newLigneAchat = await this.db.ligneAchat.create({
            data: {
              prixUnitaire: data.prixUnitaire,
              quantite: data.quantite,
              datePeremption: new Date(data.datePeremption),
              references: data.references,
              matiere: {
                connect: {
                  id: data.matiereId,
                },
              },
              magasin: {
                connect: {
                  id: data.magasinId,
                },
              },
              achat: { connect: { id: achatId } },
            },
          });

          // Mettre à jour l'achat pour refléter le paiement ajouté
          await this.db.achat.update({
          where: { id: achatId },
          data: {
            ligneAchats: {
              connect: { id: newLigneAchat.id},
            },
          },
          include: {
            ligneAchats: true, // Inclure les paiements mis à jour dans la réponse
          },
        });

      });
      const description = `Ajout d'une ligne d'achat ${data.references} pour l'achat ${achatId}`
      this.trace.logger({action: 'Ajout', description, userId }).then(res=>console.log("TRACE SAVED: ", res))

        return newLigneAchat;
      };

      updateLigneAchat = async (id: string, data: LigneAchatSave, achatId: string ,userId: string): Promise<LigneAchatFull> => {
        const check = await this.db.ligneAchat.findUnique({ where:  {id: id }, select: { references: true ,achatId: true} })
        if (!check) throw new HttpException(errors.MATIERE_INVALID, HttpStatus.BAD_REQUEST);
  
        if (check.achatId !== achatId) {
          throw new HttpException(errors.COUT_ERROR, HttpStatus.BAD_REQUEST);
        }

        if (data.quantiteLivre > data.quantite) {
          throw new HttpException(errors.QUANTITE_ERROR, HttpStatus.BAD_REQUEST);
        }

        const ligneUpdate = await this.db.ligneAchat.update({
            where: { id },
            data: {
                prixUnitaire: data.prixUnitaire,
                quantite: data.quantite,
                datePeremption: new Date(data.datePeremption),
                references: data.references,
                quantiteLivre: data.quantiteLivre,
                matiere: {
                    connect: {
                        id: data.matiereId,
                    },
                },
                magasin: {
                    connect: {
                        id: data.magasinId,
                    },
                },
            },
            select: { id: true, numero: true, references: true, quantite: true, prixUnitaire: true, magasin: true,quantiteLivre: true, qt_Utilise: true, matiere: true, datePeremption: true, createdAt: true, updatedAt: true },
        })
  
        const description = `Modification de la ligne d'achat: ${check.references}`
        this.trace.logger({action: 'Modification', description, userId }).then(res=>console.log("TRACE SAVED: ", res))
  
        return ligneUpdate
      }

      getAllLigneAchats = async (filter: StockMatiereFetcher, query: PaginationQuery): Promise<Pagination<LigneAchatFull>> => {
        let conditions = { ...filter };
    
        if (filter.magasinId !== undefined && filter.magasinId !== null) {
            conditions = { ...conditions, magasinId: filter.magasinId };
        }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;
        let order = {};
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc';
        }
    
        const ligneAchats = await this.db.ligneAchat.findMany({
            where: conditions,
            include: {
                matiere: true,
                magasin: true,
            },
        });
        console.log("lignes achats", ligneAchats);
        
    
        // Cumuler les quantités des produits ayant la même désignation de matière première et le même prix unitaire
        const cumulatedMap = new Map<string, LigneAchatFull>();
    
        ligneAchats.forEach((item) => {
            const key = `${item.matiere.designation}-${item.prixUnitaire}`;
            if (!cumulatedMap.has(key)) {
                cumulatedMap.set(key, { ...item });
            } else {
                const existingItem = cumulatedMap.get(key);
                if (existingItem) {
                    existingItem.quantite += item.quantite;
                    existingItem.quantiteLivre += item.quantiteLivre
                }
            }
        });
    
        // Convertir la map en tableau
        const cumulatedArray = Array.from(cumulatedMap.values());
    
        // Paginer les résultats cumulatifs
        const paginatedData = cumulatedArray.slice(offset, offset + limit);
        const totalCount = cumulatedArray.length;
        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<LigneAchatFull> = {
            data: paginatedData,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit,
        };
    
        return pagination;
    };
  
    //=============================DESTROY==================================== 
      destroyLigneAchat = async (id: string, userId: string): Promise<LigneAchatSelect> => {
          const check = await this.db.ligneAchat.findUnique({ where: { id: id }, select: { references: true } })
          if (!check) throw new HttpException(errors.NOT_EXIST_LIGNE, HttpStatus.BAD_REQUEST);
  
          try {
              const coutDestroy = await this.db.ligneAchat.delete({
                  where: { id },
                  select: {
                    id: true,
                    references: true
                  }
              })
  
              const description = `Suppression physique de la ligne d'achat: ${check.references}`
              this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))
  
              return coutDestroy
          } catch (_: any) {
              throw new HttpException(errors.NOT_REMOVABLE_PAIEMENT, HttpStatus.BAD_REQUEST);
          }
      }

      updateQuantiteLivreAchat = async (id: string, data: Livraison, userId: string): Promise<ligneLivraison> => {

        const check = await this.db.ligneAchat.findUnique({ 
          where: { id }, 
          select: { references: true, achatId: true, quantite: true, quantiteLivre: true } 
        });

        if (!check) {
          throw new HttpException('Ligne d\'achat introuvable', HttpStatus.NOT_FOUND);
        }

        if (data.quantiteLivre > check.quantite) {
          throw new HttpException(errors.QUANTITE_ERROR, HttpStatus.BAD_REQUEST);
        }
        const ligneUpdate = await this.db.ligneAchat.update({
          where: { id },
          data: {quantiteLivre: data.quantiteLivre + check.quantiteLivre },
          select: {
            quantiteLivre: true,
          },
        });
      
        const description = `Modification de la quantité livrée pour la ligne d'achat: ${check.references}`;
        await this.trace.logger({ action: 'Modification', description, userId });
      
        return ligneUpdate;
      }

      // ================================GET ALL LIGNE ACHAT BY STORE ID ===========================
      matierePremiereByStore = async (idMagasin: string): Promise<LigneAchatByStore[]> => {
        const ligneAchat = await this.db.ligneAchat.findMany({
            where: { magasinId: idMagasin  },
            select: {
                id: true,
                quantite: true,
                prixUnitaire: true,
                qt_Utilise: true,
                datePeremption: true,
                quantiteLivre: true,
                matiere: {
                    select: {
                        id: true,
                        designation: true
                    }
                },
                achat:{
                    select: {
                        id: true,
                        libelle: true,
                        tva: true,
                        couts: true,
                        ligneAchats: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        })
        if (ligneAchat === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        console.log(ligneAchat);
        

         // Filtrer les lignes d'achat pour lesquelles la quantité est supérieure à la quantité utilisée
         const filteredLigneAchat = ligneAchat.filter(ligne => ligne.quantite > ligne.qt_Utilise);
         
        return filteredLigneAchat
    }

    getAllLigneAchatsByProvider = async (filter: StockMatiereFetcher, idProviders: string, query: PaginationQuery): Promise<Pagination<LigneAchatFull>> => {
      let conditions = { ...filter };
  
      if (filter.magasinId !== undefined && filter.magasinId !== null) {
          conditions = { ...conditions, magasinId: filter.magasinId};
      }

    //   if (idProviders) {
    //     conditions = {
    //         ...conditions,
    //         achat: {
    //             fournisseurId: idProviders
    //         }
    //     };
    // }

        if (idProviders) {
          conditions.achat = {
              fournisseurId: idProviders
          };
      }

      const limit = query.size ? query.size : 10;
      const offset = query.page ? (query.page - 1) * limit : 0;
      let order = {};
      if (query.orderBy) {
          order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc';
      }
  
      const ligneAchats = await this.db.ligneAchat.findMany({
          where: conditions,
          include: {
              matiere: true,
              magasin: true,
              achat: true
          },
      });
  
      // Cumuler les quantités des produits ayant la même désignation de matière première et le même prix unitaire
      const cumulatedMap = new Map<string, LigneAchatFull>();
  
      ligneAchats.forEach((item) => {
          const key = `${item.matiere.designation}-${item.prixUnitaire}`;
          if (!cumulatedMap.has(key)) {
              cumulatedMap.set(key, { ...item });
          } else {
              const existingItem = cumulatedMap.get(key);
              if (existingItem) {
                  existingItem.quantite += item.quantite;
                  existingItem.quantiteLivre += item.quantiteLivre
              }
          }
      });
  
      // Convertir la map en tableau
      const cumulatedArray = Array.from(cumulatedMap.values());
  
      // Paginer les résultats cumulatifs
      const paginatedData = cumulatedArray.slice(offset, offset + limit);
      const totalCount = cumulatedArray.length;
      const totalPages = Math.ceil(totalCount / limit);
      const pagination: Pagination<LigneAchatFull> = {
          data: paginatedData,
          totalPages,
          totalCount,
          currentPage: query.page ? query.page : 1,
          size: limit,
      };
  
      return pagination;
  };
  
}
