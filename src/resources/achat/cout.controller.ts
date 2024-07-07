import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Put, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination } from "src/common/types";
import { AchatService } from "./achat.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import {  Cout, CoutSaver, CoutSaverSchema } from "./achat.types";


@Controller('couts')
@ApiTags('Achats ')
@ApiExtraModels(Pagination, Cout)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class CoutController {
    
    constructor(private service: AchatService) { }


    @Post('/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(CoutSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Cout })
    async save(@Body() data: CoutSaver, @Req() req: AuthorizedRequest): Promise<CoutSaver> {
        const userId = req.userId
        const id = req.params.achatId
        return await this.service.saveCoutToAchat(id, data, userId)
    }

    @Put('/:id/:achatId')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(CoutSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Cout })
    async update(@Body() data: CoutSaver, @Req() req: AuthorizedRequest): Promise<CoutSaver> {
        const userId = req.userId
        const id = req.params.id
        const achatId = req.params.achatId
        return await this.service.updateCout(id, data, achatId, userId)
    }


    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Cout })
    async destroy(@Req() req: AuthorizedRequest): Promise<CoutSaver> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroyCout(id, userId)
    }

 
    
}