import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, Query, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { AuthorizedRequest, Pagination, PaginationQuery } from "src/common/types";
import { AchatService } from "./achat.service";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { Achat, AchatFetcher, AchatFull, AchatReturn, AchatSaver, AchatSaverSchema, Cout, LigneAchatFull, Paiement } from "./achat.types";


@Controller('achats')
@ApiTags('Achats ')
@ApiExtraModels(Pagination, AchatFull, Paiement, Cout, LigneAchatFull)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class AchatController {
    
    constructor(private service: AchatService) { }


    @Get('/:statutAchat')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ 
        schema: {
            allOf: [
                { 
                    $ref: getSchemaPath(Pagination)
                 },
                {
                    properties: { 
                        data: {
                            type: 'array',
                            items: { $ref: getSchemaPath(AchatReturn) }
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
        @Query('search') search?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
        @Req() req?: AuthorizedRequest
        
    ) : Promise<Pagination<AchatReturn>> {
        const filter : AchatFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            search
        }
        const paginationQuery : PaginationQuery = {
            page: Number(page),
            size: Number(size),
            orderBy: order,
            orderDirection: direction,
        }
        return await this.service.list(filter,req.params.statutAchat, paginationQuery)
    }

    
    @Post('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(AchatSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async save(@Body() data: AchatSaver, @Req() req: AuthorizedRequest): Promise<Achat> {
        return await this.service.saveAchat(data, req.userId)
    }

    @Get('/findByid/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async findById(@Req() req: AuthorizedRequest): Promise<AchatFull> {
        return await this.service.findById(req.params.id)
    }

    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(AchatSaverSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async update(@Body() data: AchatSaver, @Req() req: AuthorizedRequest): Promise<Achat> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }


    @Delete('/:id/archive')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async archive(@Req() req: AuthorizedRequest): Promise<Achat> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.archive(id, userId)
    }


    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async destroy(@Req() req: AuthorizedRequest): Promise<Achat> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id/hasProductionLink/:etat')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: AchatFull })
    async remove(@Req() req: AuthorizedRequest): Promise<Achat> {
        const userId = req.userId
        const id = req.params.id
        const etat = req.params.etat
        return await this.service.remove(id, userId, etat)
    }
  
    
}