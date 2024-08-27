import {  Body, Controller, Get, HttpCode, HttpStatus,Post,Req,UseGuards,Version } from '@nestjs/common';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ResultatsService } from './resultats.service';
import { Card, FinancialData, FlitreCard, StatMonth } from './resultats.types';
import { AuthorizedRequest } from 'src/common/types';

@Controller('resultats')
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class ResultatsController {

    constructor(private service: ResultatsService) { }


    @Get('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async dateCreated(): Promise<number | null> {
        return await this.service.dateCreated();
    }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: FlitreCard })
    async save(@Body() data: FlitreCard, @Req() req: AuthorizedRequest): Promise<Card> {
        const userId = req.userId
        return await this.service.cardData(data, userId)
    }

    @Post('/stats-months')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: FlitreCard })
    async statistiqueMonths(@Body() data: StatMonth, @Req() req: AuthorizedRequest): Promise<FinancialData> {
        const userId = req.userId
        return await this.service.statistiqueMonths(data, userId)
    }

    

    
}
