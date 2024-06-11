import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Trace, TraceFetcher, TraceSaver } from './trace.types';

@Injectable()
export class TraceService {

    constructor(
        private db: PrismaClient
    ){}

    list = async (data: TraceFetcher): Promise<Trace[]> => {
        let filter = { }
        if(data.action){ filter = { ...filter, action: data.action } }
        if(data.utilisateurId){ filter = { ...filter, utilisateurId: data.utilisateurId } }

        if (data.start || data.end) {
            let dateFilter = {};
            if (data.start) {
                dateFilter = { ...dateFilter, gte: new Date(data.start) };
            }
            if (data.end) {
                dateFilter = { ...dateFilter, lte: new Date(data.end) };
            }
            filter = { ...filter, date: dateFilter };
        }

        const traces = await this.db.trace.findMany({ 
            where: filter,
            select: { id: true, action: true, description: true, createdAt: true, utilisateur: { select: { email: true } } }
        })
        return traces
    }

    logger = async (data: TraceSaver) : Promise<boolean> =>{
        try {
            const log = await this.db.trace.create({
                data: {
                    description: data.description,
                    action: data.action,
                    utilisateur: {
                        connect: {
                            id: data.userId
                        }
                    }
                }
            })
            if (log.id) return true
            else return false
        } catch (err: any) {
            return false
        }
    }
}
