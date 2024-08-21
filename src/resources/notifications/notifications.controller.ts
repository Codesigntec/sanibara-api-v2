import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { NotificationService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { Devise, DeviseFetcher, DeviseSaver, DeviseSelect, saverSchema } from './notifications.types';
import { ZodPipe } from 'src/validation/zod.pipe';

@Controller('notifications')
// @ApiTags('Devises')
// @ApiExtraModels(Pagination, Devise)
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class NotificationController {

    constructor(private service: NotificationService) { }



    // @Get('/select')
    // @Version('2')
    // @HttpCode(HttpStatus.OK)
    // @UseGuards(AuthGuard)
    // @ApiOkResponse({ type: Devise })
    // async select(): Promise<DeviseSelect[]> {
    //     return await this.service.select()
    // }

    // @Post('/')
    // @Version('2')
    // @HttpCode(HttpStatus.OK)
    // @UsePipes(new ZodPipe(saverSchema))
    // @UseGuards(AuthGuard)
    // @ApiOkResponse({ type: [DeviseSelect] })
    // async save(@Body() data: DeviseSaver, @Req() req: AuthorizedRequest): Promise<Devise> {
    //     const userId = req.userId
    //     return await this.service.save(data, userId)
    // }


}
