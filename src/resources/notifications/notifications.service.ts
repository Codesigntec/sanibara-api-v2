import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeviseFetcher, DeviseSaver, Devise, DeviseSelect } from './notifications.types';
import { errors } from './notifications.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class NotificationService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

 
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
