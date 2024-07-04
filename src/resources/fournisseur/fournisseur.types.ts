import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./fournisseur.constant"
import { AchatFull } from "../achat/achat.types"

export class FournisseurFetcher extends FetcherFilter {
}


export class FournisseurSaver {
  @ApiProperty()
  nom: string

  @ApiProperty()
  telephone: string | null

  @ApiProperty()
  email: string | null

  @ApiProperty()
  adresse: string | null

  @ApiProperty()
  societe: string | null
}

// ============= RESPONSE
export class FournisseurSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  nom: string
}

export class Fournisseur extends FournisseurSelect {
  @ApiProperty()
  numero: number

  @ApiProperty()
  telephone: string | null

  @ApiProperty()
  email: string | null

  @ApiProperty()
  adresse: string | null

  @ApiProperty()
  achats: AchatFull[] | null

  @ApiProperty()
  societe: string | null

  @ApiProperty()
  createdAt: Date
}



// ================VALIDATION

export const saverSchema = z
  .object({
    nom: z.string({
      required_error: errors.NAME_REQUIRED,
      invalid_type_error: errors.NAME_MUST_BE_STRING,
    }).min(2, errors.NAME_MUST_HAVE_2_DIGIT),
    telephone: z.string({
      invalid_type_error: errors.PHONE_MUST_BE_STRING,
    }).min(8, errors.PHONE_MUST_HAVE_8_DIGIT).optional().or(z.literal('')),
    email: z.string({
      // required_error: errors.EMAIL_REQUIRED,
      invalid_type_error: errors.EMAIL_MUST_BE_STRING,
    }).email(errors.INVALID_EMAIL).optional().or(z.literal('')),
    adresse: z.string({
      invalid_type_error: errors.ADDRESS_MUST_BE_STRING,
    }).optional().or(z.literal('')),
    societe: z.string({
      invalid_type_error: errors.ORG_MUST_BE_STRING,
    }).optional().or(z.literal('')),
  })
  .required();
