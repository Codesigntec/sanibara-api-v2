import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./unite.constant"

export class UniteFetcher extends FetcherFilter {
}

export class UniteSaver {
  @ApiProperty()
  libelle: string
}

// ============= RESPONSE
export class UniteSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  libelle: string
}
export class Unite extends UniteSelect {
  @ApiProperty()
  createdAt: Date
}

// ================VALIDATION

export const saverSchema = z
  .object({
    libelle: z.string({
      required_error: errors.LABEL_REQUIRED,
      invalid_type_error: errors.LABEL_MUST_BE_STRING,
    })
  })
  .required();