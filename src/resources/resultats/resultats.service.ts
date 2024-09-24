import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errors } from './resultats.constant';
import { TraceService } from '../trace/trace.service';
import { Card, FinancialData, FlitreCard, StatMonth, StatYear } from './resultats.types';
import { eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

@Injectable()
export class ResultatsService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

 
  dateCreated = async (): Promise<number | null> => {

        let currentYear = new Date().getFullYear();
        let resultats = null;

        if (!resultats) {
          resultats = await this.db.achat.findFirst({
            where: { removed: false, archive: false },
            orderBy: {
              date: 'asc',
            },
            select: {date: true },
          });
          currentYear = new Date(resultats.date).getFullYear();
        }

        if (!resultats) {
        
        resultats = await this.db.magasinMatierePremiere.findFirst({
            where: { removed: false, archive: false },
            orderBy: {
              createdAt: 'asc',
            },
            select: { createdAt: true },
          });
          currentYear = new Date(resultats.createdAt).getFullYear();
        }
              // Si tout est null, retourner l'année en cours
        if (!resultats) {
          currentYear = new Date().getFullYear();
          return currentYear;
        }

    return currentYear;
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
    
    if (data.start !== null  && data.end !== null && data.start !== "" && data.end !== "") {
      debut = data.start;
      fin = data.end;
      if (new Date(debut) > new Date(fin)) {
        throw new HttpException(errors.DATE_DEBUT_MUST_BE_BEFORE_DATE_FIN, HttpStatus.BAD_REQUEST);
      }
    } else {
      const achat = await this.db.achat.findFirst({
        where: { removed: false, archive: false },
        orderBy: { createdAt: 'asc' },
        select: { date: true}
      });
    
      debut = achat ? achat.date.toISOString().split('T')[0] : "";
      fin = new Date().toISOString().split('T')[0];

      if (!debut || !fin ) {
        throw new HttpException(errors.ERROR_CONVERT_DATE, HttpStatus.BAD_REQUEST);
      }
    }
  
    let startedDate: Date;
    let endDate: Date;

    if (debut === undefined || fin === undefined) {
      throw new HttpException(errors.INVALID_DATE, HttpStatus.BAD_REQUEST);
    }else{
       startedDate = new Date(debut);
       endDate = new Date(fin);
    }
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
  
  statistiqueMonths = async (data: StatMonth, userId: string): Promise<FinancialData> => {

    let { month, year } = data;

    if (month === null || year === null || month === 0 || year === 0 || month === undefined || year === undefined) {
      year = new Date().getFullYear();
      month = new Date().getMonth() + 1;
    }
 
    // Date de début du mois (1er jour à 00:00)
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  
    // Date de fin du mois (dernier jour à 23:59:59.999)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Récupère les jours de la semaine en cours
    const jours = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const financialData: FinancialData = {
      productions: Array(31).fill(0),
      depenses: Array(31).fill(0),
      ventes: Array(31).fill(0),
      approvisionnements: Array(31).fill(0)
    };
  //------------------- Calculer les ventes ----------------------------------
    for (let i = 0; i < jours.length; i++) {
 
      const jour = jours[i];

      const total = await this.db.vente.aggregate({
      _sum: {
          montant: true,
      },
      where: {
          removed: false,
          archive: false,
          etat: true,
          dateVente: {
          gte: jour,
          lt: new Date(jour.getTime() + 24 * 60 * 60 * 1000), // Ajoute 24 heures
          },
      },
      });
      financialData.ventes[i] = total._sum.montant || 0;
   }

//------------------- Calculer les charges ----------------------------------
    for (let i = 0; i < jours.length; i++) {

      const jour = jours[i];

      const total = await this.db.depense.aggregate({
      _sum: {
          montant: true,
      },
      where: {
          removed: false,
          archive: false,
          date: {
          gte: jour,
          lt: new Date(jour.getTime() + 24 * 60 * 60 * 1000), // Ajoute 24 heures
          },
      },
      });
      financialData.depenses[i] = total._sum.montant || 0;
    }
 //------------------- Calculer les productions ----------------------------------
   
  for (let i = 0; i < jours.length; i++) {

      const jour = jours[i];

      const total = await this.db.productions.aggregate({
      _sum: {
          coutTotalProduction: true,
      },
      where: {
          removed: false,
          archive: false,
          dateDebut: {
          gte: jour,
          lt: new Date(jour.getTime() + 24 * 60 * 60 * 1000), // Ajoute 24 heures
          },
      },
      });
      financialData.productions[i] = total._sum.coutTotalProduction || 0;
    }

  //------------------- Calculer les approvisionnements ----------------------------------
  for (let i = 0; i < jours.length; i++) {
    const jour = jours[i];
    
    // Récupérer tous les achats pour le jour donné
    const achats = await this.db.achat.findMany({
      where: {
        removed: false,
        archive: false,
        date: {
          gte: jour,
          lt: new Date(jour.getTime() + 24 * 60 * 60 * 1000), // Fin du jour
        },
      },
      include: {
        ligneAchats: true,
        couts: true,
      },
    });

    // Calculer le coût total pour ce jour-là
    let totalCout = 0;

    achats.forEach(achat => {
      // Calcul du coût des lignes d'achat
      const totalLigneAchats = achat.ligneAchats.reduce(
        (sum, ligne) => sum + (ligne.quantite * ligne.prixUnitaire), 
        0
      );
      // Ajouter la TVA au total
      const montantTVA = (totalLigneAchats * achat.tva) / 100;
      
      // Ajouter le coût total des lignes d'achat plus la TVA
      totalCout += totalLigneAchats + montantTVA;

      // Ajouter les coûts supplémentaires (sans TVA)
      totalCout += achat.couts.reduce((sum, cout) => sum + cout.montant, 0);
    });

    // Stocker le résultat pour le jour en cours
    financialData.approvisionnements[i] = totalCout;
  }
    return financialData;
  }
  
  statistiqueYears = async (data: StatYear, userId: string): Promise<FinancialData> => { 

    let { year } = data;

    if (year === null || year === 0 || year === undefined) {
      year = new Date().getFullYear();
    }

    // Date de début du mois (1er jour à 00:00)
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);

    // Date de fin du mois (dernier jour à 23:59:59.999)
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      // Récupère les jours de la semaine en cours
      const mois = eachMonthOfInterval({
        start: startDate,
        end: endDate,
      });

    const financialData: FinancialData = {
      productions: Array(12).fill(0),
      depenses: Array(12).fill(0),
      ventes: Array(12).fill(0),
      approvisionnements: Array(12).fill(0)
    };

      //------------------- Calculer les ventes ----------------------------------
      for (let i = 0; i < mois.length; i++) {

        const jour = mois[i];
  
        const total = await this.db.vente.aggregate({
        _sum: {
            montant: true,
        },
        where: {
            removed: false,
            archive: false,
            etat: true,
            dateVente: {
            gte: jour,
            lt: new Date(jour.getFullYear(), jour.getMonth() + 1, 1), // Premier jour du mois suivant
            },
        },
        });
        financialData.ventes[i] = total._sum.montant || 0;
     }
  
  //------------------- Calculer les charges ----------------------------------
      for (let i = 0; i < mois.length; i++) {
  
        const jour = mois[i];
  
        const total = await this.db.depense.aggregate({
        _sum: {
            montant: true,
        },
        where: {
            removed: false,
            archive: false,
            date: {
            gte: jour,
            lt: new Date(jour.getFullYear(), jour.getMonth() + 1, 1), // Premier jour du mois suivant
            },
        },
        });
        financialData.depenses[i] = total._sum.montant || 0;
      }
   //------------------- Calculer les productions ----------------------------------
     
    for (let i = 0; i < mois.length; i++) {
  
        const jour = mois[i];
  
        const total = await this.db.productions.aggregate({
        _sum: {
            coutTotalProduction: true,
        },
        where: {
            removed: false,
            archive: false,
            dateDebut: {
            gte: jour,
            lt: new Date(jour.getFullYear(), jour.getMonth() + 1, 1), // Premier jour du mois suivant
            },
        },
        });
        financialData.productions[i] = total._sum.coutTotalProduction || 0;
      }
  
    //------------------- Calculer les approvisionnements ----------------------------------
    for (let i = 0; i < mois.length; i++) {
      const jour = mois[i];
      
      // Récupérer tous les achats pour le jour donné
      const achats = await this.db.achat.findMany({
        where: {
          removed: false,
          archive: false,
          date: {
            gte: jour,
            lt: new Date(jour.getFullYear(), jour.getMonth() + 1, 1), // Premier jour du mois suivant
          },
        },
        include: {
          ligneAchats: true,
          couts: true,
        },
      });
  
      // Calculer le coût total pour ce jour-là
      let totalCout = 0;
  
      achats.forEach(achat => {
        // Calcul du coût des lignes d'achat
        const totalLigneAchats = achat.ligneAchats.reduce(
          (sum, ligne) => sum + (ligne.quantite * ligne.prixUnitaire), 
          0
        );
        // Ajouter la TVA au total
        const montantTVA = (totalLigneAchats * achat.tva) / 100;
        
        // Ajouter le coût total des lignes d'achat plus la TVA
        totalCout += totalLigneAchats + montantTVA;
  
        // Ajouter les coûts supplémentaires (sans TVA)
        totalCout += achat.couts.reduce((sum, cout) => sum + cout.montant, 0);
      });
  
      // Stocker le résultat pour le jour en cours
      financialData.approvisionnements[i] = totalCout;
    }
    return financialData;
    
  }
  
}
