import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Put, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination } from "src/common/types";
import { AchatService } from "./achat.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import {  LigneAchatFull, LigneAchatSave, LigneAchatSchema, LigneAchatSelect, PaiementFull, PaiementSave, PaiementSaverSchema } from "./achat.types";
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

 
    
}