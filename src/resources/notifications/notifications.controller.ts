import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { NotificationService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthorizedRequest, Pagination, PaginationQuery } from 'src/common/types';
import { ZodPipe } from 'src/validation/zod.pipe';
import { NotificationLIst } from './notifications.types';

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



    @Get('/')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    // @ApiOkResponse({ type: Devise })
    async list(): Promise<NotificationLIst[]> {
        return await this.service.list()
    }


    @Delete('/:id/destroy')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async destroy(@Req() req: AuthorizedRequest): Promise<string> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.destroy(id, userId)
    }

    @Delete('/:id')
    @Version('2')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async remove(@Req() req: AuthorizedRequest): Promise<string> {
        const userId = req.userId
        const id = req.params.id
        return await this.service.remove(id, userId)
    }

}
