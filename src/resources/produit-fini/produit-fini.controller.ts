import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ProduitService } from './produit-fini.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Produit, ProduitFetcher, ProduitFull, ProduitSaver, ProduitSelect, saverSchema } from './produit-fini.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('products')
@ApiTags('Produits finis')
@ApiExtraModels(Pagination, Produit)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class ProduitController {

    constructor(private service: ProduitService) { }

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
                            items: { $ref: getSchemaPath(Produit) }
                        }
                    } 
                }
            ]
        }
    })
    async list(
        @Query('archive') archive?: string | null, 
        @Query('removed') removed?: string | null,
        @Query('designation') designation?: string | null,
        @Query('uniteId') uniteId?: string | null,
        @Query('debut') debut?: string | null,
        @Query('fin') fin?: string | null,
        @Query('page') page?: string | null, 
        @Query('search') search?: string | null, 
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<Produit>> {
        const filter : ProduitFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            designation,
            uniteId,
            debut,
            fin,
            search
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction
        }
        return await this.service.list(filter, paginationQuery)
    }

    @Get('/select')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: [ProduitSelect] })
    async select(): Promise<ProduitSelect[]> {
        return await this.service.select()
    }

    @Get('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: ProduitFull })
    async findOne(@Param('id') id: string): Promise<ProduitFull> {
        return await this.service.findById(id)
    }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Produit })
    async save(@Body() data: ProduitSaver, @Req() req: AuthorizedRequest): Promise<Produit> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }

    // @Post('/filter')
    // @Version('2')
    // @HttpCode(HttpStatus.OK)
    // @UseGuards(AuthGuard)
    // async save(@Body() data: ProduitSaver, @Req() req: AuthorizedRequest): Promise<Produit> {
    //     const userId = req.userId
    //     return await this.service.save(data, userId)
    // }


    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Produit })
    async update(@Body() data: ProduitSaver, @Req() req: AuthorizedRequest): Promise<Produit> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Produit })
    async archive(@Req() req: AuthorizedRequest): Promise<Produit> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Produit })
    async destroy(@Req() req: AuthorizedRequest): Promise<Produit> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Produit })
    async remove(@Req() req: AuthorizedRequest): Promise<Produit> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
