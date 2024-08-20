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