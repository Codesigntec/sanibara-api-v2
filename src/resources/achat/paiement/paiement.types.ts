import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./paiement.constant"
import { AchatFull } from "../achat.types"

export class PaiementFetcher extends FetcherFilter {
}

export class PaiementSaver {
  @ApiProperty()
  libelle: string

  @ApiProperty()
  date: string
}

// ============= RESPONSE ================
export class PaiementSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  montant: number
}


export class PaiementFull extends PaiementSelect {

  @ApiProperty()
  numero: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  achat:    AchatFull

  @ApiProperty()
  updatedAt: Date
}


// ================VALIDATION

export const saverSchema = z
  .object({
    libelle: z.string({
      required_error: errors.LABEL_REQUIRED,
      invalid_type_error: errors.LABEL_MUST_BE_STRING,
    }),
    date: z.string({
      required_error: errors.DATE_REQUIRED,
      invalid_type_error: errors.DATE_BE_STRING,
    })
  })
  .required();