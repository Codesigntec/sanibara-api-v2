import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { ZodPipe } from 'src/validation/zod.pipe';
import { DashboardService } from './dashboard.service';

@Controller('devises')
@ApiTags('Devises')
// @ApiExtraModels(Pagination, Dashboard)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class DashboardController {

    constructor(private service: DashboardService) { }



    // @Get('/select')
    // @Version('2')
    // @HttpCode(HttpStatus.OK)
    // @UseGuards(AuthGuard)
    // @ApiOkResponse({ type: Devise })
    // async select(): Promise<DeviseSelect[]> {
    //     return await this.service.select()
    // }

    // @Get('/:id')
    // @Version('2')
    // @HttpCode(HttpStatus.OK)
    // @UseGuards(AuthGuard)
    // @ApiOkResponse({ type: [DeviseSelect] })
    // async findOne(@Param('id') id: string): Promise<DeviseSelect[]> {
    //     return await this.service.select()
    // }

    
}
