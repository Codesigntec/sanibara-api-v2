import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./depense.constant"

export class DepenseFetcher extends FetcherFilter {
  motif?: string | null
  debut?: string | null
  fin?: string | null
  min?: number | null
  max?: number | null
  search?: string
}


export class DepenseSaver {
  @ApiProperty()
  motif: string

  @ApiProperty()
  montant: number

  @ApiProperty()
  date: string

}

// ============= RESPONSE
export class Depense {
  @ApiProperty()
  id: string
  
  @ApiProperty()
  numero: number

  @ApiProperty()
  motif: string

  @ApiProperty()
  date: Date
  
  @ApiProperty()
  montant: number

  @ApiProperty()
  createdAt: Date
}

// ================VALIDATION

export const saverSchema = z
  .object({
    motif: z.string({
      required_error: errors.MOTIF_REQUIRED,
      invalid_type_error: errors.MOTIF_MUST_BE_STRING,
    }).min(3, errors.MOTIF_MUST_HAVE_3_DIGIT),
    date: z.string({
      required_error: errors.DATE_REQUIRED,
      invalid_type_error: errors.DATE_INVALID,
    }).regex(/^\d{4}-\d{2}-\d{2}$/, errors.DATE_INVALID),
    montant: z.number({
      required_error: errors.AMOUNT_REQUIRED,
      invalid_type_error: errors.AMOUNT_REQUIRED,
    }).min(0, errors.AMOUNT_INVALID2),
  })
  .required();

