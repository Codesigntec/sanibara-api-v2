import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./dashboard.constant"

export class DashboardFetcher extends FetcherFilter {
}

export class DashboardSaver {
  @ApiProperty()
  libelle: string

  @ApiProperty()
  symbole: string
}

export class DataDashboardEntete {

  @ApiProperty()
  nbr_de_production: number

  @ApiProperty()
  nbr_de_approvisionnement: number

  @ApiProperty()
  nbr_de_vente: number

  @ApiProperty()
  nbr_de_charge_fixes: number
}

export class JoursData {

  @ApiProperty()
  dimanche: number

  @ApiProperty()
  lundi: number

  @ApiProperty()
  mardi: number

  @ApiProperty()
  mercredi: number

  @ApiProperty()
  jeudi: number

  @ApiProperty()
  vendredi: number

  @ApiProperty()
  samedi: number
}


// ================VALIDATION

export const saverSchema = z
  .object({
    libelle: z.string({
      required_error: errors.LABEL_REQUIRED,
      invalid_type_error: errors.LABEL_MUST_BE_STRING,
    }),
    symbole: z.string({
      required_error: errors.SYMBOL_REQUIRED,
      invalid_type_error: errors.SYMBOL_MUST_BE_STRING,
    })
  })
  .required();