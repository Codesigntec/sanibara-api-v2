import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./structure.constant"

export class StructureFetcher extends FetcherFilter {
}



export class StructureFull {

  @ApiProperty()
  nom: string

  @ApiProperty()
  email: string

  @ApiProperty()
  telephone: string

  @ApiProperty()
  adresse: string

  @ApiProperty()
  logo: string

}

export class Structure extends StructureFull{
  @ApiProperty()
  id: string 

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

}

// ============= RESPONSE
// ================VALIDATION

export const saverSchema = z
  .object({
    id: z.string().nullable().optional(),
    nom: z.string({
      required_error: errors.NOM_REQUIRED,
      invalid_type_error: errors.NOM_MUST_BE_STRING,
    }),
    email: z.string({
      required_error: errors.EMAIL_REQUIRED,
      invalid_type_error: errors.EMAIL_MUST_BE_STRING,
    }),
    telephone: z.string({
      required_error: errors.TELEPHONE_REQUIRED,
      invalid_type_error: errors.TELEPHONE_MUST_BE_STRING,
    }),
    adresse: z.string({
      required_error: errors.ADRESSE_REQUIRED,
      invalid_type_error: errors.ADRESSE_MUST_BE_STRING,
    }),
    logo: z.string({
      invalid_type_error: errors.LOGO_MUST_BE_STRING,
    }).nullable().optional(),
  })
  .required();