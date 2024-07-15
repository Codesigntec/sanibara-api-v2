import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination, PaginationQuery } from "src/common/types";
import { AchatService } from "./achat.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import {  LigneAchatFetcher, LigneAchatFull, LigneAchatSave, LigneAchatSchema, LigneAchatSelect, ligneLivraison, MagasinQuantiteLivre } from "./achat.types";
import { LigneAchat } from "@prisma/client";


@Controller('ligneAchats')
@ApiTags('Achats ')
@ApiExtraModels(Pagination, LigneAchatFull)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class LigneAchatController {
    
    constructor(private service: AchatService) { }


    @Post('/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(LigneAchatSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: LigneAchatFull })
    async save(@Body() data: LigneAchatSave, @Req() req: AuthorizedRequest): Promise<LigneAchat> {
        const userId = req.userId
        const id = req.params.achatId
        return await this.service.saveLigneAchatToAchat(id, data, userId)
    }

    @Put('/:id/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(LigneAchatSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: LigneAchatFull })
    async update(@Body() data: LigneAchatSave, @Req() req: AuthorizedRequest): Promise<LigneAchatFull> {
        const userId = req.userId
        const id = req.params.id
        const achatId = req.params.achatId
        return await this.service.updateLigneAchat(id, data, achatId, userId)
    }


    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: LigneAchatFull })
    async destroy(@Req() req: AuthorizedRequest): Promise<LigneAchatSelect> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroyLigneAchat(id, userId)
    }


    @Put('/livraisons/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(MagasinQuantiteLivre))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: ligneLivraison })
    async updateQuantiteLivre(@Body() quantiteLivre: LigneAchatFull, @Req() req: AuthorizedRequest): Promise<ligneLivraison> {
        const userId = req.userId
        const id = req.params.id

        console.log(quantiteLivre);
        console.log(id);
        console.log(userId);
        

        return await this.service.updateQuantiteLivreAchat(id, quantiteLivre.quantiteLivre, userId)
    }
 
    @Get('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: LigneAchatFull })


    async list(
        @Query('page') page?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<LigneAchatFull>> {
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction
        }
        return await this.service.getAllLigneAchats(paginationQuery)
    }
    
}