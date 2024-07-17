import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { ProductionService } from "./production.service";
import { AuthorizedRequest } from "src/common/types";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { ProdReturn, ProdSave, Productions, ProdSaveSchema } from "./production.type";


@Controller('productions')
@ApiTags('Productions')
@ApiExtraModels()
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class ProductionController {

    constructor(private service: ProductionService) { }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(ProdSaveSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Productions })
    async save(@Body() data: ProdSave, @Req() req: AuthorizedRequest): Promise<ProdReturn> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }
    
}