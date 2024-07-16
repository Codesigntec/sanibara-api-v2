import { Controller } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse } from "@nestjs/swagger";


@Controller('productions')
@ApiTags('Productions')
@ApiExtraModels()
@ApiResponse({ status: 200, description: 'Successful.'})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 402, description: 'Subscription expired.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 500, description: 'Internal server error.'})
export class ProductionController {

}