import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./magasin.constant"

export class MagasinFetcher extends FetcherFilter {
}

export class MagasinSaver {
  @ApiProperty()
  nom: string
  adresse: string
}

// ============= RESPONSE
export class MagasinSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  nom: string
}
export class Magasin extends MagasinSelect {
  @ApiProperty()
  numero: number

  @ApiProperty()
  adresse: string

  @ApiProperty()
  createdAt: Date
}



// ================VALIDATION

export const saverSchema = z
  .object({
    nom: z.string({
      required_error: errors.NAME_REQUIRED,
      invalid_type_error: errors.NAME_MUST_BE_STRING,
    }),
    adresse: z.string({
      required_error: errors.ADDRESS_REQUIRED,
      invalid_type_error: errors.ADDRESS_MUST_BE_STRING,
    })
  })
  .required();