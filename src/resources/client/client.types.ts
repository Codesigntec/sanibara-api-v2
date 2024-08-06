import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./client.constant"

export class ClientFetcher extends FetcherFilter {
}


export class ClientSaver {
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
export class ClientSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  nom: string
}

export class Client extends ClientSelect {
  @ApiProperty()
  numero: number

  @ApiProperty()
  telephone: string | null

  @ApiProperty()
  email: string | null

  @ApiProperty()
  adresse: string | null

  @ApiProperty()
  societe: string | null

  @ApiProperty()
  createdAt: Date
}

export class StatistiqueClient{

  @ApiProperty()
  montant: number

  @ApiProperty()
  tva: number

  @ApiProperty()
  date: Date

  @ApiProperty()
  paye: number

  @ApiProperty()
  reliquat: number

  @ApiProperty()
  magasin: string
}

// export class StockPFini{

//   @ApiProperty()
//   id: string

//   @ApiProperty()
//   magasin:{
//     id: string
//     nom: string
//   }

//   @ApiProperty()
//   produitFini:{
//     id: string
//     designation: string
//   }
// }
// ================VALIDATION

export const saverSchema = z
  .object({
    nom: z.string({
      required_error: errors.NAME_REQUIRED,
      invalid_type_error: errors.NAME_MUST_BE_STRING,
    }).min(2, errors.NAME_MUST_HAVE_2_DIGIT),
    telephone: z.string({
      // required_error: "122",
      invalid_type_error: errors.PHONE_MUST_BE_STRING,
    }).min(8, errors.PHONE_MUST_HAVE_8_DIGIT).optional().or(z.literal('')),
    email: z.string({
      // required_error: "12",
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
