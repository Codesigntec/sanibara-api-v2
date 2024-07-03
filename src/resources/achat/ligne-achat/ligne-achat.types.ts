import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./ligne-achat.constant"
import { MatiereFull } from "src/resources/matiere-premiere/matiere-premiere.types";

export class LigneAchatFetcher extends FetcherFilter {
  prixUnitaire?: number | null;
  quantite?: number | null;
  datePeremption?: Date | null;
  matiereId?: string | null;
  achatId?: string | null;
  magasinId?: string | null;
}

export class LigneAchatSaver {  
  
  @ApiProperty()
  prixUnitaire: number;

  @ApiProperty()
  quantite: number;

  @ApiProperty()
  datePeremption?: Date | null;

  @ApiProperty()
  matiereId: string;

  @ApiProperty()
  achatId: string;

  @ApiProperty()
  magasinId: string;
}

// ============= RESPONSE ================
export class LigneAchatSelect {
  @ApiProperty()
  id: string
}
export class LigneAchat extends LigneAchatSelect {
  
  @ApiProperty()
  numero: number

  @ApiProperty()
  createdAt: Date
}


export class LigneAchatFull extends LigneAchat {
  @ApiProperty()
  matiere: MatiereFull

  @ApiProperty()
  cout: Cout

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