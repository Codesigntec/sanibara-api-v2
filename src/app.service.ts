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
      await this.destroy();
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

    // =======================================[ RECUPERATION ]=======================================

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

    // Récupère les magasinMatierePremiere supprimées dont la date de mise à jour dépasse un mois
    const mpToDelete = await this.db.magasinMatierePremiere.findMany({
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

    // Récupère les magasinProduitFini supprimées dont la date de mise à jour dépasse un mois
    const pfToDelete = await this.db.magasinProduitFini.findMany({
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

    // Récupère les matierePremiere supprimées dont la date de mise à jour dépasse un mois
    const matierePremiereToDelete = await this.db.matierePremiere.findMany({
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

    // Récupère les productions supprimées dont la date de mise à jour dépasse un mois
    const productionsToDelete = await this.db.productions.findMany({
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

    // Récupère les produitFinis supprimées dont la date de mise à jour dépasse un mois
    const produitFiniToDelete = await this.db.produitFini.findMany({
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

    // Récupère les role supprimées dont la date de mise à jour dépasse un mois
    const roleToDelete = await this.db.role.findMany({
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

    // Récupère les unite supprimées dont la date de mise à jour dépasse un mois
    const uniteToDelete = await this.db.unite.findMany({
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

    // Récupère les utilisateur supprimées dont la date de mise à jour dépasse un mois
    const utilisateurToDelete = await this.db.utilisateur.findMany({
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

    // Récupère les vente supprimées dont la date de mise à jour dépasse un mois
    const venteToDelete = await this.db.vente.findMany({
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

    //============================================[DELETE]===================================================


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

    // Supprime les magasinMatierePremiere récupérées
    const deleteMpPromises = mpToDelete.map(frs =>
        this.db.magasinMatierePremiere.delete({
            where: { id: frs.id }
        })
    );

    // Supprime les magasinProduitFini récupérées
    const deletePfPromises = pfToDelete.map(pf =>
        this.db.magasinProduitFini.delete({
            where: { id: pf.id }
        })
    );

    // Supprime les matierePremiere récupérées
    const deleteMatierePremierePromises = matierePremiereToDelete.map(mp =>
        this.db.matierePremiere.delete({
            where: { id: mp.id }
        })
    );

    // Supprime les productions récupérées
    const deleteproductionsPromises = productionsToDelete.map(mp =>
        this.db.productions.delete({
            where: { id: mp.id }
        })
    );

    // Supprime les produitFini récupérées
    const deleteproduitFiniPromises = produitFiniToDelete.map(mp =>
        this.db.produitFini.delete({
            where: { id: mp.id }
        })
    );

    // Supprime les role récupérées
    const deleterolePromises = roleToDelete.map(mp =>
        this.db.role.delete({
            where: { id: mp.id }
        })
    );

    // Supprime les unite récupérées
    const deleteunitePromises = uniteToDelete.map(mp =>
        this.db.unite.delete({
            where: { id: mp.id }
        })
    );

    // Supprime les utilisateur récupérées
    const deleteutilisateurPromises = utilisateurToDelete.map(mp =>
        this.db.utilisateur.delete({
            where: { id: mp.id }
        })
    );

    // Supprime les vente récupérées
    const deleteventePromises = venteToDelete.map(mp =>
        this.db.vente.delete({
            where: { id: mp.id }
        })
    );

  }


}
 