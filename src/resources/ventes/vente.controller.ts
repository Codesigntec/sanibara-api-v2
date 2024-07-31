import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination, PaginationQuery } from "src/common/types";
import saverSchemaVente, { Vente, VenteFetcher, VenteTable } from "./vente.types";
import { VentesService } from "./vente.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { Produit } from "../produit-fini/produit-fini.types";
import { Matiere, MatiereFetcher } from "../matiere-premiere/matiere-premiere.types";

@Controller('vente')
@ApiTags('Produits finis')
@ApiExtraModels(Pagination, Vente)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class VentesController {

    constructor(private service: VentesService) { }




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
                            items: { $ref: getSchemaPath(Vente) }
                        }
                    } 
                }
            ]
        }
    })
    async list(
        @Query('archive') archive?: string | null, 
        @Query('removed') removed?: string | null,
        @Query('page') page?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
        
        @Query('etat') etat?: boolean | null,
    ) : Promise<Pagination<VenteTable>> {
        const filter : VenteFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            etat,
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction
        }
        return await this.service.list(filter, paginationQuery)
    }

    

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchemaVente))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Vente })
    async save(@Body() data: Vente, @Req() req: AuthorizedRequest): Promise<Vente> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }

}