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



    listStock = async (filter: StockFetcher, query: PaginationQuery): Promise<Pagination<StockReturn>> => {
        let conditions: any = {};
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;
    
        if (filter.magasinId) {
            conditions.magasinId = {
                contains: filter.magasinId,
                mode: "insensitive"
            };
        }
    
        if (filter.prodFiniId) {  
            conditions.prodFiniId = {
                contains: filter.prodFiniId,
                mode: "insensitive"
            };
        }
    
        conditions = { ...conditions, removed: filter.removed, archive: filter.archive };

        if (filter.search) {
            conditions = {
              OR: [
                { reference: { contains: filter.search, mode: "insensitive" } }, // Recherche dans `reference` de Productions
                {
                      produitFini: {
                        designation: { contains: filter.search, mode: "insensitive" } // Recherche dans `designation` de ProduitFini
                      }
                    
                }
              ]
            };
          }
    
        let order: any = {};
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc';
        }
    
        // Récupérer toutes les entrées de stock
        const stocks = await this.db.stockProduiFini.findMany({
            where: conditions,
            include: {
                magasin: true,
                produitFini: {
                    include: {
                        unite: true
                    }
                },
                stockVente: {
                    where: {
                        removed: false
                      },
                    select: {
                        id: true,
                        quantiteVendue: true
                    }
                }
            },
            orderBy: order
        });
    
        // Cumuler les quantités des produits ayant la même désignation et le même prix unitaire
        const cumulatedMap = new Map<string, StockReturn>();
    
        stocks.forEach((item) => {
            const key = `${item.produitFini.designation}-${item.pu_gros}`;
            if (!cumulatedMap.has(key)) {
                cumulatedMap.set(key, { ...item });
            } else {
                const existingItem = cumulatedMap.get(key);
                if (existingItem) {
                    existingItem.qt_produit += item.qt_produit;
                }
            }
        });
    
        // Convertir la map en tableau
        const cumulatedArray = Array.from(cumulatedMap.values());
        // Paginer les résultats cumulés
        const paginatedData = cumulatedArray.slice(offset, offset + limit);
        const totalCount = cumulatedArray.length;
        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<StockReturn> = {
            data: paginatedData,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        };
    
        return pagination;
    };
    


}