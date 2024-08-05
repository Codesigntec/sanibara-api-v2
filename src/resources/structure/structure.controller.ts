import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { StructureService } from './structure.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { ZodPipe } from 'src/validation/zod.pipe';
import { saverSchema, Structure } from './structure.types';

@Controller('structure')
@ApiTags('Structure')
@ApiExtraModels(Pagination, Structure)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class StructureController {


    constructor(private service: StructureService) { }


    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Structure })
    async save(@Body() data: Structure, @Req() req: AuthorizedRequest): Promise<Structure> {
        const userId = req.userId
        return await this.service.saveOrUpdate(data, userId)
    }

    @Get('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Structure })
    async list(): Promise<Structure[]> {
        return await this.service.list()
    }
    


   
}
