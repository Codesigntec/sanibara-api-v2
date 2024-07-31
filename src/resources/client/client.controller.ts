import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Client, ClientFetcher, ClientSaver, ClientSelect, saverSchema } from './client.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('customers')
@ApiTags('Clients')
@ApiExtraModels(Pagination, Client)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class ClientController {

    constructor(private service: ClientService) { }

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
                            items: { $ref: getSchemaPath(Client) }
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
    ) : Promise<Pagination<Client>> {
        const filter : ClientFetcher = {
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
    @ApiOkResponse({ type: [ClientSelect] })
    async select(): Promise<ClientSelect[]> {
        return await this.service.select()
    }

    @Get('/findOne/client/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: [Client] })
    async findOne(@Param('id') id: string): Promise<Client> {
        return await this.service.findOne(id)
    }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Client })
    async save(@Body() data: ClientSaver, @Req() req: AuthorizedRequest): Promise<Client> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }


    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Client })
    async update(@Body() data: ClientSaver, @Req() req: AuthorizedRequest): Promise<Client> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Client })
    async archive(@Req() req: AuthorizedRequest): Promise<Client> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Client })
    async destroy(@Req() req: AuthorizedRequest): Promise<Client> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Client })
    async remove(@Req() req: AuthorizedRequest): Promise<Client> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}
