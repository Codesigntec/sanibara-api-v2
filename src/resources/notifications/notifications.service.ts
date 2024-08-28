import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Devise, PrismaClient } from '@prisma/client';
import {  NotificationLIst, NotificationSaver } from './notifications.types';
import { errors } from './notifications.constant';
import { TraceService } from '../trace/trace.service';
import { subDays } from 'date-fns';

import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }





  list = async (): Promise<NotificationLIst[]> => {
    const data = await this.db.notification.findMany({
        where: {
            is_read: false
        },
        select: {
            id: true,
            message: true,
            is_read: true,
            createdAt: true,
            type: true,
            idObject: true
        }
    });

    return data;
  }

    destroy = async (id: string, userId: string): Promise<string> => {
        const check = await this.db.notification.findUnique({ where: { id: id }, select: { id: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const devise = await this.db.notification.delete({
                where: { id },
                select: { id: true }
            })

            const description = `Suppression physique de la notification: ${check.id}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return "Supprision effectuee avec succes"
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }


    remove = async (id: string, userId: string): Promise<string> => {
        const check = await this.db.notification.findUnique({ where: { id: id }, select: { id: true, is_read: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const notif = await this.db.notification.update({
            where: { id },
            data: {
                is_read: !check.is_read
            },
            select: {
                id: true,
            }
            // select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Suppression logique de la notification: ${check.id}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return "Supprimerion effectuee avec succes"
    }
}
