import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { DeviseService } from './devise.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Devise, DeviseFetcher, DeviseSaver, DeviseSelect, saverSchema } from './devise.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('devises')
@ApiTags('Devises')
@ApiExtraModels(Pagination, Devise)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class DeviseController {

    constructor(private service: DeviseService) { }

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
                            items: { $ref: getSchemaPath(Devise) }
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
        @Query('search') search?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<Devise>> {
        const filter : DeviseFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
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
    @ApiOkResponse({ type: Devise })
    async select(): Promise<DeviseSelect[]> {
        return await this.service.select()
    }

    @Get('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: [DeviseSelect] })
    async findOne(@Param('id') id: string): Promise<DeviseSelect[]> {
        return await this.service.select()
    }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: [DeviseSelect] })
    async save(@Body() data: DeviseSaver, @Req() req: AuthorizedRequest): Promise<Devise> {
        const userId = req.userId
        console.log("req",req);
        console.log("userId",userId);
        return await this.service.save(data, userId)
    }


    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Devise })
    async update(@Body() data: DeviseSaver, @Req() req: AuthorizedRequest): Promise<Devise> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Devise })
    async archive(@Req() req: AuthorizedRequest): Promise<Devise> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Devise })
    async destroy(@Req() req: AuthorizedRequest): Promise<Devise> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Devise })
    async remove(@Req() req: AuthorizedRequest): Promise<Devise> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
