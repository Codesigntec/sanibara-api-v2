import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./achat.constant"
import { LigneAchat, LigneAchatFull } from "./ligne-achat/ligne-achat.types"
import { CoutFull } from "./cout/cout.types"
import { PaiementFull } from "./paiement/paiement.types"

export class AchatFetcher extends FetcherFilter {
}

export class AchatSaver {
  @ApiProperty()
  libelle: string

  @ApiProperty()
  date: string
}

// ============= RESPONSE ================
export class AchatSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  libelle: string
}
export class Achat extends AchatSelect {
  
  @ApiProperty()
  numero: number

  @ApiProperty()
  createdAt: Date
}


export class AchatFull extends Achat {
  @ApiProperty()
  ligneAchat: LigneAchatFull[]

  @ApiProperty()
  cout: CoutFull[]

  @ApiProperty()
  paiement: PaiementFull[]

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