import { Injectable } from '@nestjs/common';
import { Etat, PrismaClient, StatutAchat } from '@prisma/client';
import { TraceService } from '../trace/trace.service';
import { Achat, AchatFetcher, AchatFull, AchatSaver, } from './achat.types';
import { Pagination, PaginationQuery } from 'src/common/types';

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
                    couts: true,
                    paiements: true,
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

    //=====================SAVE====================================

     saveAchat = async (data: AchatSaver, userId: string): Promise<Achat> => {

      console.log("Received data:", data);

      // if (data.etat === 'en cours') {
      //   data.etat = Etat.EN_COURS;
      // } else if (data.etat === 'livre') {
      //   data.etat = Etat.LIVREE;
      // } else {
      //   throw new Error("Invalid or missing 'etat'");
      // }

      // if (data.statutAchat === 'achat') {
      //   data.statutAchat = StatutAchat.ACHETER;
      // }else if (data.statutAchat === 'facture') {
      //   data.statutAchat = StatutAchat.COMMANDE;
      // }else{
      //   throw new Error("Invalid or missing 'statutAchat'");
      // }


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

      
        const achat = await this.db.achat.create({
          data: {
            libelle: data.libelle,
            date: new Date(data.date),
            // statutAchat: data.statutAchat,
            // etat: data.etat,
            tva: data.tva,
            ligneAchats: {
              create: data.ligneAchats.map((ligne) => ({
                prixUnitaire: ligne.prixUnitaire,
                quantite: ligne.quantite,
                datePeremption: ligne.datePeremption,
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


}
