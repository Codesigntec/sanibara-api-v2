import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { ProductionService } from "./production.service";
import { AuthorizedRequest, Pagination, PaginationQuery } from "src/common/types";
import { ZodPipe } from "src/validation/zod.pipe";
import { AuthGuard } from "../auth/auth.guard";
import { ProdReturn, ProdSave, Productions, ProdSaveSchema, ProductionsReturn, ProductionFetcher } from "./production.type";


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
                            items: { $ref: getSchemaPath(ProductionsReturn) }
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
        @Query('debut') debut?: string | null,
        @Query('fin') fin?: string | null,
        @Query('size') size?: string | null,
        @Query('order') order?: string | null,
        @Query('direction') direction?: string | null,
    ) : Promise<Pagination<ProductionsReturn>> {
        const filter : ProductionFetcher = {
            archive: (archive && archive === '1') ? true : false,
            removed: (removed && removed === '1') ? true : false,
            debut,
            fin
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
    @UsePipes(new ZodPipe(ProdSaveSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Productions })
    async save(@Body() data: ProdSave, @Req() req: AuthorizedRequest): Promise<ProdReturn> {
        const userId = req.userId
        return await this.service.save(data, userId)
    }


    @Get('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: ProductionsReturn })
    async findOne(@Param('id') id: string): Promise<ProductionsReturn> {
        return await this.service.findById(id)
    }

    @Put('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ZodPipe(ProdSaveSchema))
    @UseGuards(AuthGuard)
    @ApiOkResponse({ type: Productions })
    async update(@Body() data: ProdSave, @Req() req: AuthorizedRequest): Promise<ProdReturn> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.update(id, data, userId)
    }
}