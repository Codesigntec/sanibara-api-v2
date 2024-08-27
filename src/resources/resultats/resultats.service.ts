import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errors } from './resultats.constant';
import { TraceService } from '../trace/trace.service';
import { Card, FlitreCard } from './resultats.types';

@Injectable()
export class ResultatsService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

 
    dateCreated = async (): Promise<number | null> => {
        const achat = await this.db.achat.findFirst({
          where: { removed: false, archive: false },
          orderBy: {
            createdAt: 'asc',
          },
          select: { createdAt: true }
        });
        return achat ? achat.createdAt.getFullYear() : null;
      }

  cardData = async (data: FlitreCard, userId: string): Promise<Card> => {

    let card: Card = {
      charge_production: 0,
      approvisionnements: 0,
      ventes: 0,
      charges_fixes: 0,
      benefices_reels: 0,
      benefices_previsionnels_en_gros: 0,
      benefices_previsionnels_en_detail: 0
    }

    let debut: string;
    let fin: string;
    
    if (data.debut && data.fin) {
      debut = data.debut;
      fin = data.fin;
    } else {
      const achat = await this.db.achat.findFirst({
        where: { removed: false, archive: false },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      });
    
      debut = achat ? achat.createdAt.toISOString().split('T')[0] : "";
      fin = new Date().toISOString().split('T')[0];

      if (!debut || !fin || new Date(debut) > new Date(fin)) {
        throw new HttpException(errors.DATE_DEBUT_MUST_BE_BEFORE_DATE_FIN, HttpStatus.BAD_REQUEST);
      }
    }
    
      const startedDate = new Date(debut);
      const endDate = new Date(fin);
      
      endDate.setHours(23, 59, 59, 999);

    //------------------- Calculer les charges fixeses ------------------
    const depense_charges = await this.db.depense.findMany({
      where: {
        createdAt: {
          gte: startedDate,
          lte: endDate
        },
        removed: false,
        archive: false
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, montant: true }
    });
    card.charges_fixes = depense_charges.reduce((total, depense) => total + depense.montant, 0);
    //------------------- Calculer les charges fixeses ------------------
    //------------------- Calculer d'approvisionnements ------------------
    const achat_approvisionnements = await this.db.achat.findMany({
      where: {
        createdAt: {
          gte: startedDate,
          lte: endDate
        },
        removed: false,
        archive: false
      },
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        tva: true,
        ligneAchats: {
          select: {
            quantite: true,
            prixUnitaire: true
          }
        },
        couts: {
          select: {
            montant: true
          }
        }
      }
    });
    
    let sommesTotalCouts = 0;
    let sommesTotalLigneAchat = 0;
    
    achat_approvisionnements.forEach(achat => {
      // Cumuler tous les coûts de l'achat en cours
      const totalCouts = achat.couts.reduce((total, cout) => total + cout.montant, 0);
      sommesTotalCouts += totalCouts;
    
      // Cumuler tous les montants des lignes d'achat avec TVA
      const totalLigneAchats = achat.ligneAchats.reduce((total, ligne) => total + (ligne.quantite * ligne.prixUnitaire), 0);
      sommesTotalLigneAchat += totalLigneAchats * (1 + achat.tva / 100);
    });
    
    card.approvisionnements = sommesTotalLigneAchat + sommesTotalCouts;
    //------------------- Calculer d'approvisionnements -------------------------------
    //------------------- Calculer les charges liées à la production ------------------
    const production = await this.db.productions.findMany({
      where: {
        createdAt: {
          gte: startedDate,
          lte: endDate
        },
        removed: false,
        archive: false
      },
      orderBy: { createdAt: 'asc' },
      select: { 
        createdAt: true, 
        coutProduction: {
          select: {
            montant: true
          }
        }
      }        
    });
    
    let totalCoutProduction = 0;
    
    production.forEach(production => {
      totalCoutProduction += production.coutProduction.reduce((total, cout) => total + cout.montant, 0);
    });

    card.charge_production = totalCoutProduction;
    //------------------- Calculer les charges liées à la production ------------------
    //------------------- Calculer les ventes ----------------------------------
    const ventes = await this.db.vente.findMany({
      where: {
        etat: true,
        createdAt: {
          gte: startedDate,
          lte: endDate
        },
        removed: false,
        archive: false
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, montant: true }
    })
    

   const ligneProduction = await this.db.stockProduiFini.findMany({
    where: {
      removed: false,
      archive: false,
      productions: {
          createdAt: {
            gte: startedDate,
            lte: endDate
          },
      }
    },
    select: { 
      id: true, 
      pu_gros: true,
      pu_detail: true,
      qt_produit: true,
    }
   })

    card.ventes = ventes.reduce((total, vente) => total + vente.montant, 0);
    //------------------------- Calculer les ventes ----------------------------------
    //------------------- Calculer les Bénéfices réels ----------------------------------
    card.benefices_reels = card.ventes - (card.charges_fixes + card.approvisionnements + card.charge_production);
    //------------------------- Calculer les Bêfices réels ----------------------------------
    //------------------- Calculer les Bêfices prédédits ----------------------------------
    let benefice_previsionnel_en_gros: number = 0;
    let benefice_previsionnel_en_detail: number = 0;

    ligneProduction.forEach(ligne => {
      benefice_previsionnel_en_gros += (ligne.pu_gros * ligne.qt_produit);
      benefice_previsionnel_en_detail += (ligne.pu_detail * ligne.qt_produit);
    });

    card.benefices_previsionnels_en_gros = benefice_previsionnel_en_gros - (card.charges_fixes + card.approvisionnements + card.charge_production);
    card.benefices_previsionnels_en_detail = benefice_previsionnel_en_detail - (card.charges_fixes + card.approvisionnements + card.charge_production);
    //------------------------- Calculer les Bêfices prédédits ----------------------------------
    
    const description = `Retour des résultats de la card ${debut} - ${fin}`
    this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

    return card
  }
     
  
}
