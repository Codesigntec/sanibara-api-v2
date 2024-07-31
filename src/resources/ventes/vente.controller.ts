import { Controller } from "@nestjs/common";
import { ApiTags, ApiExtraModels, ApiResponse } from "@nestjs/swagger";
import { Pagination } from "src/common/types";
import { Vente } from "./vente.types";
import { VentesService } from "./vente.service";

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


}