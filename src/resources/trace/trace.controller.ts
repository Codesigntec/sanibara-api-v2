import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards, Version } from '@nestjs/common';
import { TraceService } from './trace.service';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Pagination, PaginationQuery } from 'src/common/types';
import { Trace, TraceFetcher } from './trace.types';

@Controller('traces')
@ApiTags('Traces')
@ApiExtraModels(Pagination, Trace)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class TraceController {

    constructor(private service: TraceService) { }

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
                            items: { $ref: getSchemaPath(Trace) }
                        }
                    } 
                }
            ]
        }
    })
    async list(
        @Query('action') action?: string | null,
        @Query('utilisateurId') utilisateurId?: string | null,
        @Query('page') page?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
        @Query('debut') debut?: string | null,
        @Query('fin') fin?: string | null,
        @Query('email') email?: string | null,
        @Query('search') search?: string | null,
    ) : Promise<Pagination<Trace>> {
        const filter : TraceFetcher = {
            action,
            utilisateurId,
            debut,
            fin,
            search,
            email
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction
        }
        return await this.service.list(filter, paginationQuery)
    }
}
