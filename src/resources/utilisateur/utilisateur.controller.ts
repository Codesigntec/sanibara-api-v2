import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { UtilisateurService } from './utilisateur.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { AccesMagasin, Utilisateur, UtilisateurFetcher, UtilisateurFull, UtilisateurSaver, UtilisateurSelect, saverSchema, updaterSchema } from './utilisateur.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('users')
@ApiTags('users')
@ApiExtraModels(Pagination, Utilisateur, UtilisateurFull, AccesMagasin)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class UtilisateurController {

    constructor(private service: UtilisateurService) { }

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
                            items: { $ref: getSchemaPath(Utilisateur) }
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
        @Query('search') search?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<Utilisateur>> {
        const filter : UtilisateurFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            search
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction,
        }
        return await this.service.list(filter, paginationQuery)
    }

    @Get('/select')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: UtilisateurSelect })
    async select(): Promise<UtilisateurSelect[]> {
        return await this.service.select()
    }

    @Get('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    // @ApiOkResponse({ type: Utilisateur })
    @ApiOkResponse({ 
        schema: {
            allOf: [
                { $ref: getSchemaPath(UtilisateurFull) },
                {
                    properties: { 
                        accesMagasinsProduitsFinis: {
                            type: 'array',
                            items: { $ref: getSchemaPath(AccesMagasin) }
                        },
                        accesMagasinsMatierePremieres: {
                            type: 'array',
                            items: { $ref: getSchemaPath(AccesMagasin) }
                        }
                    } 
                }
            ]
        }
    })
    async findOne(@Param('id') id: string): Promise<UtilisateurFull> {
        return await this.service.findById(id)
    }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Utilisateur })
    async save(@Body() data: UtilisateurSaver, @Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }


    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(updaterSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Utilisateur })
    async update(@Body() data: UtilisateurSaver, @Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Utilisateur })
    async archive(@Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Utilisateur })
    async destroy(@Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Utilisateur })
    async remove(@Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
