import { Controller, Post, Version, HttpCode, HttpStatus, UsePipes, UseGuards, Body, Req, Put, Delete } from "@nestjs/common"
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger"
import { Pagination, AuthorizedRequest } from "src/common/types"
import { ZodPipe } from "src/validation/zod.pipe"
import { PaiementSave } from "../achat/achat.types"
import { AuthGuard } from "../auth/auth.guard"
import { VentesService } from "./vente.service"
import { PaiementVente, PaiementSaverSchema } from "./vente.types"



@Controller('paiementsVente')
@ApiTags('vente ')
@ApiExtraModels(Pagination, PaiementVente)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class PaiementController {
    
    constructor(private service: VentesService) { }


    @Post('/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(PaiementSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: PaiementVente })
    async save(@Body() data: PaiementSave, @Req() req: AuthorizedRequest): Promise<PaiementVente> {
        const userId = req.userId
        const id = req.params.achatId
        return await this.service.savePaiementToAchat(id, data, userId)
    }

    @Put('/:id/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(PaiementSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: PaiementVente })
    async update(@Body() data: PaiementSave, @Req() req: AuthorizedRequest): Promise<PaiementVente> {
        const userId = req.userId
        const id = req.params.id
        const achatId = req.params.achatId
        return await this.service.updatePaiement(id, data, achatId, userId)
    }


    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: PaiementVente })
    async destroy(@Req() req: AuthorizedRequest): Promise<PaiementVente> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroyPaiement(id, userId)
    }

 
    
}