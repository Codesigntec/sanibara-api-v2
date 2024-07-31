import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination } from "src/common/types";
import saverSchemaVente, { Vente } from "./vente.types";
import { VentesService } from "./vente.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { Produit } from "../produit-fini/produit-fini.types";

@Controller('vente')
@ApiTags('Produits finis')
@ApiExtraModels(Pagination, Vente)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class VentesController {

    constructor(private service: VentesService) { }



    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(saverSchemaVente))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Vente })
    async save(@Body() data: Vente, @Req() req: AuthorizedRequest): Promise<Vente> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }

}