import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Devise, PrismaClient } from '@prisma/client';
import {  NotificationSaver } from './notifications.types';
import { errors } from './notifications.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';
import { subDays } from 'date-fns';

@Injectable()
export class NotificationService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    save = async (): Promise<NotificationSaver> => {
      
        const produits = await this.db.ligneAchat.findMany({
            where: {
                datePeremption: {
                    lte: subDays(new Date(), 7) // Produits expirant dans les 7 jours
                },
            },
            select: {
                id: true,
                quantite: true,
                quantiteLivre: true,
                datePeremption: true,
                matiere: {
                    select: {
                        id: true,
                        designation: true
                    }
                },
                magasin: {
                    select: {
                        id: true,
                        nom: true
                    }
                }
                
            }
            
          });
    
        for (const produit of produits) {
            await this.db.notification.create({
                data: {
                    type: 'expiration',
                    message: `Le produit ${produit.matiere.designation} dans le magasin [ ${produit.magasin.nom} ]est sur le point d'expirer.`,
                }
            });
        }

    }
 
    destroy = async (id: string, userId: string): Promise<Devise> => {
        const check = await this.db.devise.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const devise = await this.db.devise.delete({
                where: { id },
                select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true }
            })

            const description = `Suppression physique du devise: ${check.libelle}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return devise
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
