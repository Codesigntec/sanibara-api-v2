import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./notifications.constant"

export class DeviseFetcher extends FetcherFilter {
}

export class NotificationSaver {
  @ApiProperty()
  libelle: string

  @ApiProperty()
  symbole: string
}

export class NotificationLIst {

  @ApiProperty()
  message: string

  @ApiProperty()
  is_read: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  type: string

  @ApiProperty()
  idObject: string
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