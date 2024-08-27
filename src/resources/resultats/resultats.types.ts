import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./resultats.constant"

export class ResultatsFetcher extends FetcherFilter {
}


export class FlitreCard{
  @ApiProperty()
  start?: string | null

  @ApiProperty()
  end?: string | null
}
export class Card {

  @ApiProperty()
  charge_production: number

  @ApiProperty()
  approvisionnements: number

  @ApiProperty()
  ventes: number

  @ApiProperty()
  charges_fixes: number

  @ApiProperty()
  benefices_reels: number

  @ApiProperty()
  benefices_previsionnels_en_gros: number

  @ApiProperty()
  benefices_previsionnels_en_detail: number
}


// ================VALIDATION

// export const saverSchema = z
//   .object({
//     libelle: z.string({
//       required_error: errors.LABEL_REQUIRED,
//       invalid_type_error: errors.LABEL_MUST_BE_STRING,
//     }),
//     symbole: z.string({
//       required_error: errors.SYMBOL_REQUIRED,
//       invalid_type_error: errors.SYMBOL_MUST_BE_STRING,
//     })
//   })
//   .required();