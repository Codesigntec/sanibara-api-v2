import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, getSchemaPath, ApiOkResponse } from "@nestjs/swagger";
import { StocksService } from "./stock-produit-fini";
import { StockFetcher, StockReturn } from "./production.type";
import { Pagination, PaginationQuery } from "src/common/types";
import { AuthGuard } from "../auth/auth.guard";

@Controller('stock-produit-fini')
@ApiTags('Stock Produit Fini')
@ApiExtraModels()
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class StockProduiFiniController {

    constructor(private service: StocksService) { }





    @Get('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ 
        schema: {
            allOf: [
                { $ref: getSchemaPath(Pagination) },
                {
                    properties: { 
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(StockReturn) }
                        }
                    } 
                }
            ]
        }
    })
    async listStock(
        @Query('archive') archive?: string | null, 
        @Query('removed') removed?: string | null,
        @Query('page') page?: string | null,
        @Query('search') search?: string | null,
        @Query('prodFiniId') prodFiniId?: string | null,
        @Query('magasinId') magasinId?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<StockReturn>> {
        const filter : StockFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            prodFiniId,
            magasinId,
            search
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction
        }
        return await this.service.listStock(filter, paginationQuery)
    }


}