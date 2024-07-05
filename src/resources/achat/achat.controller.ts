import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination, PaginationQuery } from "src/common/types";
import { AchatService } from "./achat.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { Achat, AchatFetcher, AchatFull, AchatSaver, AchatSaverSchema } from "./achat.types";


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


    @Get('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ 
        schema: {
            allOf: [
                { $ref: getSchemaPath(Pagination) },
                {
                    properties: { 
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(AchatFull) }
                        }
                    } 
                }
            ]
        }
    })
    async list(
        @Query('archive') archive?: string | null, 
        @Query('removed') removed?: string | null,
        @Query('page') page?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<AchatFull>> {
        const filter : AchatFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction
        }
        return await this.service.list(filter, paginationQuery)
    }

    
    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(AchatSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async save(@Body() data: AchatSaver, @Req() req: AuthorizedRequest): Promise<Achat> {
        console.log("==============Data Achat ==================");
        console.log(data);
        return await this.service.saveAchat(data, req.userId)
    }



  
}