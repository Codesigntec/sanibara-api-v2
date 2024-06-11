import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UtilisateurService } from './utilisateur.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Utilisateur, UtilisateurFetcher, UtilisateurFull, UtilisateurSaver, UtilisateurSelect, saverSchema, updaterSchema } from './utilisateur.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('users')
@ApiTags('users')
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class UtilisateurController {

    constructor(private service: UtilisateurService) { }

    @Get('/')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiResponse({ type: Pagination<Utilisateur>})
    async list(
        @Query('archive') archive?: string | null, 
        @Query('removed') removed?: string | null,
        @Query('page') page?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<Utilisateur>> {
        const filter : UtilisateurFetcher = {
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
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async select(): Promise<UtilisateurSelect[]> {
        return await this.service.select()
    }

    @Get('/:id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async findOne(@Param('id') id: string): Promise<UtilisateurFull> {
        return await this.service.findById(id)
    }

    @Post('/')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    async save(@Body() data: UtilisateurSaver, @Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }


    @Put('/:id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(updaterSchema))
    @UseGuards(AuthGuard)
    async update(@Body() data: UtilisateurSaver, @Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async archive(@Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async destroy(@Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async remove(@Req() req: AuthorizedRequest): Promise<Utilisateur> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
