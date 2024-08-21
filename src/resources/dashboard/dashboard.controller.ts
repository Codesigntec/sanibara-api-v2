import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { ZodPipe } from 'src/validation/zod.pipe';
import { DashboardService } from './dashboard.service';
import { DataDashboardEntete } from './dashboard.types';

@Controller('dashboard')
// @ApiTags('Devises')
// @ApiExtraModels(Pagination, Dashboard)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class DashboardController {

    constructor(private service: DashboardService) { }



    @Get('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async dataDashboardEntete(): Promise<DataDashboardEntete> {
        return await this.service.dataDashboardEntete()
    }

    @Get('/joursData')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async jourData(): Promise<Record<string, number[]>> {
        return await this.service.joursData()
    }

    @Get('/data/annee')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async anneeData(): Promise<Record<string, number[]>> {
        return await this.service.anneeData()
    }

    

    
}
