import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { DepenseService } from './depense.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Depense, DepenseFetcher, DepenseSaver, saverSchema } from './depense.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('charges')
@ApiTags('depense')
@ApiExtraModels(Pagination, Depense)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class DepenseController {

    constructor(private service: DepenseService) { }

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
                            items: { $ref: getSchemaPath(Depense) }
                        }
                    } 
                }
            ]
        }
    })
    async list(
        @Query('archive') archive?: string | null, 
        @Query('removed') removed?: string | null,
        @Query('motif') motif?: string | null,
        @Query('min') min?: string | null,
        @Query('max') max?: string | null,
        @Query('debut') debut?: string | null,
        @Query('fin') fin?: string | null,
        @Query('page') page?: string | null,
        @Query('search') search?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<Depense>> {
        const filter : DepenseFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            motif,
            min: (min && !isNaN(parseInt(min))) ? parseInt(min) : 0,
            max: (max && !isNaN(parseInt(max))) ? parseInt(max) : undefined,
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

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Depense })
    async save(@Body() data: DepenseSaver, @Req() req: AuthorizedRequest): Promise<Depense> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }


    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Depense })
    async update(@Body() data: DepenseSaver, @Req() req: AuthorizedRequest): Promise<Depense> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Depense })
    async archive(@Req() req: AuthorizedRequest): Promise<Depense> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Depense })
    async destroy(@Req() req: AuthorizedRequest): Promise<Depense> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Depense })
    async remove(@Req() req: AuthorizedRequest): Promise<Depense> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
