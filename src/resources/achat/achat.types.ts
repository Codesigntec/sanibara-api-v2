import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { string, z } from "zod"
import { errors } from "./achat.constant"
import { Etat, StatutAchat } from "@prisma/client"
import { FournisseurSelect } from "../fournisseur/fournisseur.types"

export class AchatFetcher extends FetcherFilter {
}


class MatiereInput {
  @ApiProperty()
  id: string;
}

class MagasinInput {
  @ApiProperty()
  id: string;
}
export class Paiement{
  id: string
  @ApiProperty()
  montant: number
}
//================LIGNE ACHAT===================

export class LigneAchatSelect {
  @ApiProperty()
  id: string

  @ApiProperty()
  references: string
}

export class LigneAchat extends LigneAchatSelect {

  @ApiProperty()
  prixUnitaire: number

  @ApiProperty()
  quantite: number

  @ApiProperty()
  datePeremption: Date | null

  @ApiProperty()
  matiere: MatiereInput

  @ApiProperty()
  magasin: MagasinInput

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

}


export class LigneAchatSave {

  @ApiProperty()
  quantiteLivre: number

  @ApiProperty()
  references: string

  @ApiProperty()
  prixUnitaire: number

  @ApiProperty()
  quantite: number

  @ApiProperty()
  datePeremption: Date | null

  @ApiProperty()
  matiereId: string

  @ApiProperty()
  magasinId: string
}

// =============COUT================
export class CoutSelect {
  @ApiProperty()
  id: string
  @ApiProperty()
  libelle: string
}
export class Cout extends CoutSelect {
  @ApiProperty()
  montant: number

  @ApiProperty()
  motif: string
}

class CoutSaver {
  @ApiProperty()
  libelle: string;

  @ApiProperty()
  montant: number;

  @ApiProperty()
  motif: string;

  @ApiProperty()
  achatId: string;
}


export class AchatSaver {
  @ApiProperty()
  libelle: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  tva?: number;

  @ApiProperty()
  statutAchat?: string;

  @ApiProperty()
  etat?: string;

  @ApiProperty()
  fournisseur?: FournisseurSelect;

  @ApiProperty()
  ligneAchats: LigneAchat[];

  @ApiProperty()
  couts: Cout[];

  @ApiProperty()
  paiements: Paiement[];
}




// ============= RESPONSE ACHAT ================
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
  ligneAchats: LigneAchat[]

  @ApiProperty()
  date: Date

  @ApiProperty()
  statutAchat: StatutAchat

  @ApiProperty()
  etat: Etat

  @ApiProperty()
  tva: number

  @ApiProperty()
  couts: Cout[]| null

  @ApiProperty()
  paiements: Paiement[] | null

  @ApiProperty()
  updatedAt: Date
}




// ================VALIDATION


const MatiereInputSchema = z.object({
  id: z.string(),
});

const MagasinInputSchema = z.object({
  id: z.string(),
});

const LigneAchatInputSchema = z.object({
  prixUnitaire: z.number(),
  quantite: z.number(),
  datePeremption: z.date().optional().nullable(),
  references: z.string().optional(),
  matiere: MatiereInputSchema,
  magasin: MagasinInputSchema,
});

const CoutInputSchema = z.object({
  libelle: z.string(),
  montant: z.number(),
  motif: z.string(),
});

const PaiementInputSchema = z.object({
  montant: z.number(),
});

//===============Export=================

export const AchatSaverSchema = z.object({
  libelle: z.string(
    {
      required_error: errors.LABEL_REQUIRED,
      invalid_type_error: errors.LABEL_MUST_BE_STRING,
    }
  ),
  date: z.string({
    required_error: errors.DATE_REQUIRED,
    invalid_type_error: errors.DATE_BE_STRING,
  }),
  tva: z.number(),
  statutAchat: z.nativeEnum(StatutAchat),
  etat: z.nativeEnum(Etat),
  fournisseurId: z.string().optional(),
  ligneAchats: z.array(LigneAchatInputSchema),
  couts: z.array(CoutInputSchema),
  paiements: z.array(PaiementInputSchema),
}).required();

