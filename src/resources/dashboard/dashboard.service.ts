import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errors } from './dashboard.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';
import { DashboardFetcher, DataDashboardEntete, JoursData } from './dashboard.types';
import { eachDayOfInterval, eachMonthOfInterval, endOfWeek, endOfYear, format, startOfWeek, startOfYear } from 'date-fns';

@Injectable()
export class DashboardService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    // dataDashboardEntete = async (filter: DashboardFetcher): Promise<DataDashboardEntete> => {

    //     const conditions = { ...filter }

    //     const totalCountProduction = await this.db.productions.count({ where: conditions });
    //     const totalCountApprovisionnement = await this.db.achat.count({ where: conditions });
    //     const totalCountVente = await this.db.vente.count(
    //         {
    //              where: {
    //                 etat: true,
    //                  ...conditions 
    //                 }
    //         }
    //     );
    // const totalCountDepenseOuChargeFixe = await this.db.depense.count({ where: conditions });

    // const data = {
    //     nbr_de_production: totalCountProduction !== 0 ? totalCountProduction : 0,
    //     nbr_de_approvisionnement:  totalCountApprovisionnement !== 0 ? totalCountApprovisionnement : 0,
    //     nbr_de_vente: totalCountVente !== 0 ? totalCountVente : 0,
    //     nbr_de_charge_fixes: totalCountDepenseOuChargeFixe !== 0 ? totalCountDepenseOuChargeFixe : 0
    // }

    //     return data;
    // }



    dataDashboardEntete = async (): Promise<DataDashboardEntete> => {
 
        const totalCountProduction = await this.db.productions.count({ where: {
            removed: false,
            archive: false
        } });
        const totalCountApprovisionnement = await this.db.achat.count({ where: {
            removed: false,
            archive: false
        } });
        const totalCountVente = await this.db.vente.count(
            {
                 where: {
                    etat: true,
                     removed: false,
                     archive: false 
                    }
            }
        );
    const totalCountDepenseOuChargeFixe = await this.db.depense.count({ where: {
        removed: false,
        archive: false
    } });

    const data = {
        nbr_de_production: totalCountProduction !== 0 ? totalCountProduction : 0,
        nbr_de_approvisionnement:  totalCountApprovisionnement !== 0 ? totalCountApprovisionnement : 0,
        nbr_de_vente: totalCountVente !== 0 ? totalCountVente : 0,
        nbr_de_charge_fixes: totalCountDepenseOuChargeFixe !== 0 ? totalCountDepenseOuChargeFixe : 0
    }

        return data;
    }


    joursData = async (): Promise<Record<string, number[]>> => {

        const now = new Date();
        const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });  
        const endOfWeekDate = endOfWeek(now, { weekStartsOn: 1 }); 

        // Récupère les jours de la semaine en cours
        const jours = eachDayOfInterval({
            start: startOfWeekDate,
            end: endOfWeekDate,
        });

        // Initialise un objet pour stocker les résultats par jour
        const resultatsTotal: Record<string, number[]> = {};
        // Initialise un tableau pour stocker les résultats par jour
         const resultatsProduction: number[] = new Array(jours.length).fill(0);
         const resultatsApprovisionnement: number[] = new Array(jours.length).fill(0);
         const resultatsCharges: number[] = new Array(jours.length).fill(0);
         const resultatsVente: number[] = new Array(jours.length).fill(0);

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
        resultatsProduction[i] = total._sum.coutTotalProduction || 0;
        }

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
            resultatsApprovisionnement[i] = totalCout;
          }

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
            resultatsCharges[i] = total._sum.montant || 0;
         }


        for (let i = 0; i < jours.length; i++) {

            const jour = jours[i];

            const total = await this.db.vente.aggregate({
            _sum: {
                montant: true,
            },
            where: {
                removed: false,
                archive: false,
                dateVente: {
                gte: jour,
                lt: new Date(jour.getTime() + 24 * 60 * 60 * 1000), // Ajoute 24 heures
                },
            },
            });
            resultatsVente[i] = total._sum.montant || 0;
         }
        
         resultatsTotal['productions'] = resultatsProduction;
         resultatsTotal['approvisionnements'] = resultatsApprovisionnement;
         resultatsTotal['charges'] = resultatsCharges;
         resultatsTotal['ventes'] = resultatsVente;

        
        return resultatsTotal;
    }
 

    anneeData = async (): Promise<Record<string, number[]>> => {

        const now = new Date();
        const startOfYearDate = startOfYear(now);  
        const endOfYearDate = endOfYear(now);

        // Récupère les mois de l'année en cours
        const mois = eachMonthOfInterval({
            start: startOfYearDate,
            end: endOfYearDate,
        });

        // Initialise un objet pour stocker les résultats par mois
        const resultatsTotal: Record<string, number[]> = {};
        // Initialise des tableaux pour stocker les résultats par mois
        const resultatsProduction: number[] = new Array(mois.length).fill(0);
        const resultatsApprovisionnement: number[] = new Array(mois.length).fill(0);
        const resultatsCharges: number[] = new Array(mois.length).fill(0);
        const resultatsVente: number[] = new Array(mois.length).fill(0);

        for (let i = 0; i < mois.length; i++) {
            const debutMois = mois[i];
            const finMois = new Date(debutMois.getFullYear(), debutMois.getMonth() + 1, 0); // Dernier jour du mois

            const totalProduction = await this.db.productions.aggregate({
                _sum: {
                    coutTotalProduction: true,
                },
                where: {
                    removed: false,
                    archive: false,
                    dateDebut: {
                        gte: debutMois,
                        lt: finMois,
                    },
                },
            });
            resultatsProduction[i] = totalProduction._sum.coutTotalProduction || 0;

            const achats = await this.db.achat.findMany({
                where: {
                    removed: false,
                    archive: false,
                    date: {
                        gte: debutMois,
                        lt: finMois,
                    },
                },
                include: {
                    ligneAchats: true,
                    couts: true,
                },
            });

            let totalCout = 0;
            achats.forEach(achat => {
                const totalLigneAchats = achat.ligneAchats.reduce(
                    (sum, ligne) => sum + (ligne.quantite * ligne.prixUnitaire), 
                    0
                );
                const montantTVA = (totalLigneAchats * achat.tva) / 100;
                totalCout += totalLigneAchats + montantTVA;
                totalCout += achat.couts.reduce((sum, cout) => sum + cout.montant, 0);
            });
            resultatsApprovisionnement[i] = totalCout;

            const totalCharges = await this.db.depense.aggregate({
                _sum: {
                    montant: true,
                },
                where: {
                    removed: false,
                    archive: false,
                    date: {
                        gte: debutMois,
                        lt: finMois,
                    },
                },
            });
            resultatsCharges[i] = totalCharges._sum.montant || 0;

            const totalVente = await this.db.vente.aggregate({
                _sum: {
                    montant: true,
                },
                where: {
                    removed: false,
                    archive: false,
                    dateVente: {
                        gte: debutMois,
                        lt: finMois,
                    },
                },
            });
            resultatsVente[i] = totalVente._sum.montant || 0;
        }

        resultatsTotal['productions'] = resultatsProduction;
        resultatsTotal['approvisionnements'] = resultatsApprovisionnement;
        resultatsTotal['charges'] = resultatsCharges;
        resultatsTotal['ventes'] = resultatsVente;

        return resultatsTotal;
    }


    
}
