import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { MatiereService } from './matiere-premiere.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Matiere, MatiereFetcher, MatiereFull, MatiereSaver, MatiereSelect, saverSchema } from './matiere-premiere.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('matrials')
@ApiTags('Matieres premieres')
@ApiExtraModels(Pagination, Matiere)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class MatiereController {

    constructor(private service: MatiereService) { }

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
                            items: { $ref: getSchemaPath(Matiere) }
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
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<Matiere>> {
        const filter : MatiereFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            designation,
            uniteId,
            debut,
            fin
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
    @ApiOkResponse({ type: [MatiereSelect] })
    async select(): Promise<MatiereSelect[]> {
        return await this.service.select()
    }

    @Get('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async findOne(@Param('id') id: string): Promise<MatiereFull> {
        return await this.service.findById(id)
    }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    async save(@Body() data: MatiereSaver, @Req() req: AuthorizedRequest): Promise<Matiere> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }

    // @Post('/filter')
    // @Version('2')
    // @HttpCode(HttpStatus.OK)
    // @UseGuards(AuthGuard)
    // async save(@Body() data: MatiereSaver, @Req() req: AuthorizedRequest): Promise<Matiere> {
    //     const userId = req.userId
    //     return await this.service.save(data, userId)
    // }


    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    async update(@Body() data: MatiereSaver, @Req() req: AuthorizedRequest): Promise<Matiere> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async archive(@Req() req: AuthorizedRequest): Promise<Matiere> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async destroy(@Req() req: AuthorizedRequest): Promise<Matiere> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async remove(@Req() req: AuthorizedRequest): Promise<Matiere> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
