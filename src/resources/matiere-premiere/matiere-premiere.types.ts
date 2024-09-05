import { ApiExtraModels, ApiProperty } from "@nestjs/swagger"
import { FetcherFilter, Pagination } from "src/common/types"
import { z } from "zod"
import { errors } from "./matiere-premiere.constant"
import { Unite, UniteSelect } from "../unite/unite.types"
// import { Categorie, CategorieSelect } from "../categorie/categorie.types"

export class MatiereFetcher extends FetcherFilter {
  designation?: string | null
  description?: string | null
  debut?: string | null
  fin?: string | null
  uniteId?: string | null
  search?: string | null
}


export class MatiereSaver {
  @ApiProperty()
  designation: string

  @ApiProperty()
  description: string | null

  @ApiProperty()
  uniteId: string

}


export class MatiereFilter {
  @ApiProperty()
  debut?: string | null
  
  @ApiProperty()
  fin?: string | null

  @ApiProperty()
  uniteId?: string | null

}

// ============= RESPONSE
export class MatiereSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  designation: string
}

@ApiExtraModels(MatiereSelect)
export class MatiereLight extends MatiereSelect {
  @ApiProperty()
  description: string | null

  @ApiProperty()
  createdAt: Date
}

@ApiExtraModels(MatiereLight)
export class Matiere extends MatiereLight {
  @ApiProperty()
  unite: UniteSelect
}

@ApiExtraModels(Matiere)
export class MatiereFull extends Matiere {

  @ApiProperty()
  unite: Unite

  @ApiProperty()
  updatedAt: Date
}



// ================VALIDATION

export const saverSchema = z
  .object({
    designation: z.string({
      required_error: errors.NAME_REQUIRED,
      invalid_type_error: errors.NAME_MUST_BE_STRING,
    }).min(2, errors.NAME_MUST_HAVE_2_DIGIT),
    uniteId: z.string({
      required_error: errors.UNITY_REQUIRED,
      invalid_type_error: errors.UNITY_MUST_BE_STRING,
    }),
    description: z.string({
      invalid_type_error: errors.DESC_MUST_BE_STRING,
    }).optional().or(z.literal('')),
  })
  .required();

