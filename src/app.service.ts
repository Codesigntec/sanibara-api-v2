import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

@Injectable()
export class AppService {

  constructor(
    private readonly db: PrismaClient,
  ) {}
  getHello(): string {
    console.log("Hello World!");
    return 'Hello World!';
  }


  @Cron(CronExpression.EVERY_DAY_AT_10AM)
 // @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
      console.log("Running a task every 30 seconds");
      await this.checkExpiringProducts();
  }

   formatDetailedDate = (strDate: string) => {
    const date = new Date(strDate);
  
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
  
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
  
    return `${day}/${month}/${year} - ${hours} H ${minutes} min ${seconds}`;
  };

  async checkExpiringProducts() {
      try {
      // Check for expiring products
      const produits = await this.db.ligneAchat.findMany({
          where: {
          datePeremption: {
              lte: subDays(new Date(), -14), // Produits expirant dans les 7 jours
          },
          },
          select: {
          id: true,
          quantite: true,
          quantiteLivre: true,
          datePeremption: true,
          qt_Utilise: true,
          matiere: {
              select: {
              id: true,
              designation: true,
              },
          },
          magasin: {
              select: {
              id: true,
              nom: true,
              },
          },
          },
      });

      for (const produit of produits) {
          const notification = await this.db.notification.findFirst({
          where: {
              idObject: `1_${produit.id}`,
          },
          });

          if (!notification) {
          await this.db.notification.create({
              data: {
              type: 'expiration',
              message:`[${produit.quantite - produit.qt_Utilise}] de [${produit.matiere.designation}] dans le [${produit.magasin.nom}] expire le ${this.formatDetailedDate(produit.datePeremption.toDateString())}.`,
              is_read: false,
              idObject: `1_${produit.id}`,
              },
          });
          }
      }
      // Check for expiring finished products
      const produitsFini = await this.db.stockProduiFini.findMany({
          where: {
          datePeremption: {
              lte: subDays(new Date(), -30), // Produits expirant dans les 7 jours
          },
          },
          select: {
          id: true,
          qt_produit: true,
          datePeremption: true,
          produitFini: {
              select: {
              id: true,
              designation: true,
              },
          },
          magasin: {
              select: {
              id: true,
              nom: true,
              },
          },
          },
      });

      for (const produitFini of produitsFini) {
          const notification = await this.db.notification.findFirst({
          where: {
              idObject: `2_${produitFini.id}`,
          },
          });

          if (!notification) {
          await this.db.notification.create({
              data: {
              type: 'expiration',
              message: `Le produit [${produitFini.produitFini.designation}] dans [${produitFini.magasin.nom}] expire le ${this.formatDetailedDate(produitFini.datePeremption.toDateString())}.`,
              is_read: false,
              idObject: `2_${produitFini.id}`,
              },
          });
          }
      }
      } catch (error) {
       console.error("Error checking expiring products:", error);
      }
  }

  async destroy() {

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Récupère les dépenses supprimées dont la date de mise à jour dépasse un mois
    const depensesToDelete = await this.db.depense.findMany({
        where: {
            removed: true,
            updatedAt: {
                lt: oneMonthAgo
            }
        },
        select: {
            id: true,
            removed: true,
            updatedAt: true
        }
    });

    // Récupère les achats supprimées dont la date de mise à jour dépasse un mois
    const achatToDelete = await this.db.achat.findMany({
        where: {
            removed: true,
            updatedAt: {
                lt: oneMonthAgo
            }
        },
        select: {
            id: true,
            removed: true,
            updatedAt: true
        }
    });

    // Récupère les clients supprimées dont la date de mise à jour dépasse un mois
    const clientToDelete = await this.db.client.findMany({
        where: {
            removed: true,
            updatedAt: {
                lt: oneMonthAgo
            }
        },
        select: {
            id: true,
            removed: true,
            updatedAt: true
        }
    });

   // Récupère les devises supprimées dont la date de mise à jour dépasse un mois
    const devisesToDelete = await this.db.devise.findMany({
        where: {
            removed: true,
            updatedAt: {
                lt: oneMonthAgo
            }
        },
        select: {
            id: true,
            removed: true,
            updatedAt: true
        }
    });

    // Récupère les fournisseurs supprimées dont la date de mise à jour dépasse un mois
    const frsToDelete = await this.db.fournisseur.findMany({
        where: {
            removed: true,
            updatedAt: {
                lt: oneMonthAgo
            }
        },
        select: {
            id: true,
            removed: true,
            updatedAt: true
        }
     });




    
    // Supprime les dépenses récupérées
    const deleteDepensesPromises = depensesToDelete.map(depense =>
        this.db.depense.delete({
            where: { id: depense.id }
        })
    );

    // Supprime les achats récupérées
    const deleteAchatPromises = achatToDelete.map(achat =>
        this.db.achat.delete({
            where: { id: achat.id }
        })
    );

    // Supprime les clients récupérées
    const deleteClientPromises = clientToDelete.map(client =>
        this.db.client.delete({
            where: { id: client.id }
        })
    );
    
    // Supprime les devises récupérées
    const deleteDevisePromises = devisesToDelete.map(devise =>
        this.db.devise.delete({
            where: { id: devise.id }
        })
    );

    // Supprime les frs récupérées
    const deleteFrsPromises = frsToDelete.map(frs =>
        this.db.fournisseur.delete({
            where: { id: frs.id }
        })
    );



  }
}
 