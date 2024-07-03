import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./cout.constant"

export class CoutFetcher extends FetcherFilter {
}


export class CoutSaver {
  @ApiProperty()
  libelle: string
  
  @ApiProperty()
  montant: number

  @ApiProperty()
  motif: string
}

// ============= RESPONSE ================
export class CoutSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  libelle: string
}
export class Cout extends CoutSelect {
  
  @ApiProperty()
  numero: number

  @ApiProperty()
  createdAt: Date
}


export class CoutFull extends Cout {
  @ApiProperty()
  ligneAchat: LigneAchatFull[]

  @ApiProperty()
  cout: Cout[]

  @ApiProperty()
  paiement: Paiement[]

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