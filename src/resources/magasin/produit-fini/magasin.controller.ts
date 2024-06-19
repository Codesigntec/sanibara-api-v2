import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { MagasinService } from './magasin.service';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Magasin, MagasinFetcher, MagasinSaver, MagasinSelect, saverSchema } from '../magasin.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('product-stores')
@ApiTags('magasins des produits finis')
@ApiExtraModels(Pagination, Magasin)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class MagasinController {

    constructor(private service: MagasinService) { }

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
                            items: { $ref: getSchemaPath(Magasin) }
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
    ) : Promise<Pagination<Magasin>> {
        const filter : MagasinFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
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
    @ApiOkResponse({ type: [MagasinSelect] })
    async select(): Promise<MagasinSelect[]> {
        return await this.service.select()
    }

    @Get('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: [MagasinSelect] })
    async findOne(@Param('id') id: string): Promise<MagasinSelect[]> {
        return await this.service.select()
    }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Magasin })
    async save(@Body() data: MagasinSaver, @Req() req: AuthorizedRequest): Promise<Magasin> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }


    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Magasin })
    async update(@Body() data: MagasinSaver, @Req() req: AuthorizedRequest): Promise<Magasin> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Magasin })
    async archive(@Req() req: AuthorizedRequest): Promise<Magasin> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Magasin })
    async destroy(@Req() req: AuthorizedRequest): Promise<Magasin> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Magasin })
    async remove(@Req() req: AuthorizedRequest): Promise<Magasin> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
