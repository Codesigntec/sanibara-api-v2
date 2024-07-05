import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination } from "src/common/types";
import { AchatService } from "./achat.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { Achat, AchatFull, AchatSaver, AchatSaverSchema } from "./achat.types";


@Controller('achats')
@ApiTags('Achats ')
@ApiExtraModels(Pagination, AchatFull)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class AchatController {
    
    constructor(private service: AchatService) { }

    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(AchatSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async save(@Body() data: AchatSaver, @Req() req: AuthorizedRequest): Promise<Achat> {
        console.log("==================",data);
        // const userId = req.userId
        return await this.service.saveAchat(data, req.userId)
    }

}