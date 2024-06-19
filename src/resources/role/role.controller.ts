import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { AccessSaver, Role, RoleFetcher, RoleFull, RoleSaver, RoleSelect, accessSaverSchema, saverSchema } from './role.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('roles')
@ApiTags('roles')
@ApiExtraModels(Pagination, Role)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class RoleController {

    constructor(private service: RoleService) { }

    @Get('/')
    @Version('1')
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
                            items: { $ref: getSchemaPath(Role) }
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
    ) : Promise<Pagination<Role>> {
        const filter : RoleFetcher = {
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
    @ApiOkResponse({ type: [RoleSelect] })
    async select(): Promise<RoleSelect[]> {
        return await this.service.select()
    }

    @Get('/:id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: RoleFull })
    async findOne(@Param('id') id: string): Promise<RoleFull> {
        return await this.service.findById(id)
    }

    @Post('/')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Role })
    async save(@Body() data: RoleSaver, @Req() req: AuthorizedRequest): Promise<Role> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }

    @Put('/:id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Role })
    async update(@Body() data: RoleSaver, @Req() req: AuthorizedRequest): Promise<Role> {
        const userId = req.userId
        const id = req.params.id
        console.log("hey")
        return await this.service.update(id, data, userId)
    }

    @Put('/:id/accesses')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(accessSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Role })
    async accesses(@Body() data: AccessSaver[], @Req() req: AuthorizedRequest): Promise<Role> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.setAccesses(id, data, userId)
    }

    @Delete('/:id/archive')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Role })
    async archive(@Req() req: AuthorizedRequest): Promise<Role> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }

    @Delete('/:id/destroy')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Role })
    async destroy(@Req() req: AuthorizedRequest): Promise<Role> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Role })
    async remove(@Req() req: AuthorizedRequest): Promise<Role> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }
}

interface AccessSetter {
    accesses: AccessSaver[]
}