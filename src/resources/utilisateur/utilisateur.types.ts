import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./utilisateur.constant"
import { RoleSelect } from "../role/role.types"
// import { MagasinSelect } from "../magasin/magasin.types"

export class UtilisateurFetcher extends FetcherFilter {
}

export class UtilisateurMagasinsSaver {
  @ApiProperty()
  value: string

  @ApiProperty()
  label: string
}

export class UtilisateurSaver {
  @ApiProperty()
  nom: string

  @ApiProperty()
  email: string

  @ApiProperty()
  password: string

  @ApiProperty()
  roleId: string

  @ApiProperty()
  magasinsPrduitsFinis: UtilisateurMagasinsSaver[] | null

  @ApiProperty()
  magasinsMatieresPremieres: UtilisateurMagasinsSaver[] | null
}

export class UtilisateurUpdater {
  @ApiProperty()
  nom: string

  @ApiProperty()
  email: string

  @ApiProperty()
  password?: string | null

  @ApiProperty()
  roleId: string

  @ApiProperty()
  magasinsPrduitsFinis: UtilisateurMagasinsSaver[] | null

  @ApiProperty()
  magasinsMatieresPremieres: UtilisateurMagasinsSaver[] | null
}

// ============= RESPONSE
export class UtilisateurSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  nom: string
}
export class UtilisateurLight extends UtilisateurSelect {
  @ApiProperty()
  numero: number

  @ApiProperty()
  email: string

  @ApiProperty()
  status: boolean
}
export class Utilisateur extends UtilisateurLight {

  @ApiProperty()
  role: RoleSelect

  @ApiProperty()
  createdAt: Date
}

export class UtilisateurFull extends Utilisateur {

  @ApiProperty()
  accesMagasinsProduitsFinis: AccesMagasin[]

  @ApiProperty()
  accesMagasinsMatierePremieres: AccesMagasin[]

  @ApiProperty()
  archive: boolean

  @ApiProperty()
  removed: boolean

  @ApiProperty()
  updatedAt: Date
}

export class AccesMagasin {
  @ApiProperty()
  magasin: any//MagasinSelect
}


// ================VALIDATION

const accessMagasinSchemaInfo = z
  .object({
    value: z.string({
      invalid_type_error: errors.INVALID_STORE,
    }).optional().or(z.literal('')),
    label: z.string({
      invalid_type_error: errors.INVALID_STORE,
    }).optional().or(z.literal('')),
  })
  .required();


export const saverSchema = z
  .object({
    nom: z.string({
      required_error: errors.NAME_REQUIRED,
      invalid_type_error: errors.NAME_MUST_BE_STRING,
    }).min(2, errors.NAME_MUST_HAVE_2_DIGIT),
    password: z.string({
      required_error: errors.PASSWORD_REQUIRED,
    }).min(6, errors.PASSWORD_MUST_HAVE_6_DIGIT),
    email: z.string({
      required_error: errors.EMAIL_REQUIRED,
      invalid_type_error: errors.EMAIL_MUST_BE_STRING,
    }).email(errors.INVALID_EMAIL),
    roleId: z.string({
      required_error: errors.ROLE_REQUIRED,
    }),
    magasins: z.array(accessMagasinSchemaInfo)
  })
  .required();

export const updaterSchema = z
  .object({
    nom: z.string({
      required_error: errors.NAME_REQUIRED,
      invalid_type_error: errors.NAME_MUST_BE_STRING,
    }).min(2, errors.NAME_MUST_HAVE_2_DIGIT),
    // password: z.string({
    //   // required_error: errors.PASSWORD_REQUIRED,
    // }).min(6, errors.PASSWORD_MUST_HAVE_6_DIGIT).optional(),
    // password: z.union([z.string().length(0), z.string().min(6, "errors.PASSWORD_MUST_HAVE_6_DIGIT")])
    // .optional().or(z.literal('')),
    password: z.string().min(6, errors.PASSWORD_MUST_HAVE_6_DIGIT).optional().or(z.literal('')),
    email: z.string({
      required_error: errors.EMAIL_REQUIRED,
      invalid_type_error: errors.EMAIL_MUST_BE_STRING,
    }).email(errors.INVALID_EMAIL),
    roleId: z.string({
      required_error: errors.ROLE_REQUIRED,
    }),
    magasins: z.array(accessMagasinSchemaInfo)
  })
  .required();