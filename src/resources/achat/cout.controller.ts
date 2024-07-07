import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Put, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination } from "src/common/types";
import { AchatService } from "./achat.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import {  CoutSaverSchema, PaiementFull, PaiementSave } from "./achat.types";


@Controller('paiements')
@ApiTags('Achats ')
@ApiExtraModels(Pagination, PaiementFull)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class PaiementController {
    
    constructor(private service: AchatService) { }


    @Post('/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(CoutSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: PaiementFull })
    async save(@Body() data: PaiementSave, @Req() req: AuthorizedRequest): Promise<PaiementFull> {
        const userId = req.userId
        const id = req.params.achatId
        return await this.service.savePaiementToAchat(id, data)
    }

    @Put('/:id/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(CoutSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: PaiementFull })
    async update(@Body() data: PaiementSave, @Req() req: AuthorizedRequest): Promise<PaiementFull> {
        const userId = req.userId
        const id = req.params.id
        const achatId = req.params.achatId
        return await this.service.updatePaiement(id, data, achatId, userId)
    }


    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: PaiementFull })
    async destroy(@Req() req: AuthorizedRequest): Promise<PaiementFull> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroyPaiement(id, userId)
    }

 
    
}