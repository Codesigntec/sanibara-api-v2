import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { Pagination, PaginationQuery } from "src/common/types";
import { StockFetcher, StockReturn } from "./production.type";



@Injectable()
export class StocksService {
    
    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }





    list = async (filter: StockFetcher, query: PaginationQuery): Promise<Pagination<StockReturn>> => {
        let conditions = {}
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;
  
        // let filters = { }
        if (filter.magasinId) {
            conditions = {
                ...conditions,
                magasinId: {
                    contains: filter.magasinId,
                    mode: "insensitive"
                }
            }
        }

        if (filter.prodFiniId) {
            conditions = {
                ...conditions,
                prodFiniId: {
                    contains: filter.prodFiniId,
                    mode: "insensitive"
                }
            }
        }

        conditions = { ...conditions, removed: filter.removed, archive: filter.archive }
  
        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }
  
        const stocks = await this.db.stockProduiFini.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            include: {
                magasin: true,
                produitFini: true
            },
            orderBy: order
        })
        const totalCount = await this.db.productions.count({ where: conditions });
  
        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<StockReturn> = {
            data: stocks,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }
  
        return pagination
       }


}