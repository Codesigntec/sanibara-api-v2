import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errors } from './dashboard.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';
import { DashboardFetcher } from './dashboard.types';

@Injectable()
export class DashboardService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    // list = async (filter: DashboardFetcher, query: PaginationQuery): Promise<Pagination<Devise>> => {
    //     const conditions = { ...filter }
    //     const limit = query.size ? query.size : 10;
    //     const offset = query.page ? (query.page - 1) * limit : 0;

    //     let order = {}
    //     if(query.orderBy){
    //         order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
    //     }

    //     const devises = await this.db.devise.findMany({
    //         take: limit,
    //         skip: offset,
    //         where: conditions,
    //         select: { id: true, numero: true, libelle: true, symbole: true, createdAt: true, },
    //         orderBy: order
    //     })

    //     const totalCount = await this.db.devise.count({ where: conditions });

    //     const totalPages = Math.ceil(totalCount / limit);
    //     const pagination: Pagination<Devise> = {
    //         data: devises,
    //         totalPages,
    //         totalCount,
    //         currentPage: query.page ? query.page : 1,
    //         size: limit
    //     }

    //     return pagination
    // }

    // select = async (): Promise<DeviseSelect[]> => {
    //     const devises = await this.db.devise.findMany({
    //         where: { removed: false, archive: false },
    //         select: { id: true, libelle: true }
    //     })
    //     return devises
    // }

}
