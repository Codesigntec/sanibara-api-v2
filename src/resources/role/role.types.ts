import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./role.constant"
import { Utilisateur, UtilisateurLight } from "../utilisateur/utilisateur.types"

export class RoleFetcher extends FetcherFilter {
}

export class RoleSaver {
  @ApiProperty()
  libelle: string
}

export class AccessSaver {
  @ApiProperty()
  module: string

  @ApiProperty()
  read: boolean

  @ApiProperty()
  write: boolean

  @ApiProperty()
  remove: boolean

  @ApiProperty()
  archive: boolean

}

// ============= RESPONSE
export class RoleSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  libelle: string
}
export class Role extends RoleSelect {
  @ApiProperty()
  numero: number

  @ApiProperty()
  createdAt: Date
}

export class RoleFull extends Role {
  @ApiProperty()
  accesses: Access[]

  @ApiProperty()
  users: UtilisateurLight[]

  @ApiProperty()
  updatedAt: Date
}

export class Access extends AccessSaver {
  @ApiProperty()
  id: string
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

  const accessSaverSchemaInfo = z
  .object({
    module: z.string({
      required_error: errors.LABEL_REQUIRED,
      invalid_type_error: errors.LABEL_MUST_BE_STRING,
    }),
    read: z.boolean({
      required_error: errors.READ_REQUIRED,
      invalid_type_error: errors.READ_MUST_BE_BOOL,
    }),
    write: z.boolean({
      required_error: errors.WRITE_REQUIRED,
      invalid_type_error: errors.WRITE_MUST_BE_BOOL,
    }),
    remove: z.boolean({
      required_error: errors.REMOVE_REQUIRED,
      invalid_type_error: errors.REMOVE_MUST_BE_BOOL,
    }),
    archive: z.boolean({
      required_error: errors.ARCHIVE_REQUIRED,
      invalid_type_error: errors.ARCHIVE_MUST_BE_BOOL,
    })
  })
  .required();

  export const accessSaverSchema = z.array(accessSaverSchemaInfo)