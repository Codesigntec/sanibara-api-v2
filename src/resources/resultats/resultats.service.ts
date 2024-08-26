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
      benefices_previsionnels: 0
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
      const depense = await this.db.depense.findMany();

      console.log("Date depense", depense[0].createdAt);
      console.log("Start Date", startedDate);
      console.log("End Date", endDate);
            
   
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
    // depense_charges.forEach((depense) => {
    //   card.charges_fixes = depense_charges.reduce((total, depense) => total + depense.montant, 0);
    // })
    const description = `Retour des résultats de la card ${debut} - ${fin}`
    this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

    return card
  }
     
  
}
