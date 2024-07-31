import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination, PaginationQuery } from "src/common/types";
import saverSchemaVente, { Vente, VenteArchiveDeleteAndDestory, VenteFetcher, VenteTable } from "./vente.types";
import { VentesService } from "./vente.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { StockProduiFini } from "../production/production.type";

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




    @Get('/:etat')
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
        @Req() req?: AuthorizedRequest
    ) : Promise<Pagination<VenteTable>> {
        const filter : VenteFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction
        }
        return await this.service.list(filter, req.params.etat, paginationQuery)
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

    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchemaVente))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Vente })
    async update(@Body() data: Vente, @Req() req: AuthorizedRequest): Promise<Vente> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    
    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Vente })
    async archive(@Req() req: AuthorizedRequest): Promise<VenteArchiveDeleteAndDestory> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Vente })
    async destroy(@Req() req: AuthorizedRequest): Promise<VenteArchiveDeleteAndDestory> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Vente })
    async remove(@Req() req: AuthorizedRequest): Promise<VenteArchiveDeleteAndDestory> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }


    

    @Get('/quantiteRestant/produitFini/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: [StockProduiFini] })
    async findOne(@Param('id') id: string): Promise<number> {
        return await this.service.quantiteRestant(id)
    }
}