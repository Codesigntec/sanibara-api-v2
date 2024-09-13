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
    return 'Hello World!';
  }



  @Cron(CronExpression.EVERY_DAY_AT_10AM)
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
}
