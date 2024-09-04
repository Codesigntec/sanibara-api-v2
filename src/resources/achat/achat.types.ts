import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import {  optional, z } from "zod"
import { errors } from "./achat.constant"
import { Etat, StatutAchat } from "@prisma/client"
import { FournisseurSelect } from "../fournisseur/fournisseur.types"

export class AchatFetcher extends FetcherFilter {
  statutAchat?: StatutAchat

}

export class StockMatiereFetcher extends FetcherFilter {
  magasinId?: string | null
  achat?: {
    fournisseurId?: string;
} | null;
}

export class matierePremiereByStoreFletcher extends FetcherFilter {
  magasinId?: string | null
}
export class LigneAchatFetcher{

}

class MatiereInput {
  @ApiProperty()
  id: string;
  @ApiProperty()
  designation: string;
}

class MagasinInput {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nom: string;
}
export class Paiement{
  @ApiProperty()
  id: string
  @ApiProperty()
  montant: number
}

export class PaiementFull{
  @ApiProperty()
  id: string
  @ApiProperty()
  montant: number
  @ApiProperty()
  createdAt: Date
  @ApiProperty()
  updatedAt: Date
}


export class PaiementSave{
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
export class ligneLivraison {

  @ApiProperty()
  quantiteLivre: number = 0

}
export class LigneAchatFull extends LigneAchatSelect {

  @ApiProperty()
  prixUnitaire: number

  @ApiProperty()
  quantite: number

  @ApiProperty()
  quantiteLivre: number = 0

  @ApiProperty()
  qt_Utilise: number = 0

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

export class AchatAvecTva{
  @ApiProperty()
  id: string

  @ApiProperty()
  libelle: string;

  @ApiProperty()
  tva?: number;

  @ApiProperty()
  couts?: Cout[];

  ligneAchats?: LigneAchatA[]

}

export class Livraison{
  @ApiProperty()
  quantiteLivre : number
}

export class LigneAchatA{
  @ApiProperty()
  id: string
}

export class LigneAchatByStore{

  @ApiProperty()
  id: string

  @ApiProperty()
  prixUnitaire: number;

  @ApiProperty()
  quantite: number;

  @ApiProperty()
  quantiteLivre: number = 0;

  @ApiProperty()
  matiere: MatiereInput

  @ApiProperty()
  achat: AchatAvecTva

}


export class LigneAchatProduction extends LigneAchatSelect {
  @ApiProperty()
  prixUnitaire: number;

  @ApiProperty()
  quantite: number;

  @ApiProperty()
  quantiteLivre: number = 0;

  @ApiProperty()
  qt_Utilise: number = 0;

  @ApiProperty()
  datePeremption: Date | null;

  @ApiProperty()
  matiere: MatiereInput;

  @ApiProperty()
  magasin: MagasinInput;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  achat: AchatAvecTva

  @ApiProperty()
  references: string; // Ajout de la propriété manquante
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

// ================COUT==================
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
  motif?: string
}

export class CoutSaver {
  @ApiProperty()
  libelle: string;

  @ApiProperty()
  montant: number;

  @ApiProperty()
  motif?: string;

}


export class AchatSaver {
  @ApiProperty()
  libelle: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  tva?: number;

  @ApiProperty()
  statutAchat?: StatutAchat;

  @ApiProperty()
  etat?: Etat;

  @ApiProperty()
  fournisseur?: FournisseurSelect;

  @ApiProperty()
  ligneAchats: LigneAchatFull[];

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
  ligneAchats: LigneAchatFull[]

  @ApiProperty()
  date: Date

  @ApiProperty()
  statutAchat: StatutAchat

  @ApiProperty()
  etat: Etat

  @ApiProperty()
  tva?: number

  @ApiProperty()
  fournisseur?: FournisseurSelect

  @ApiProperty()
  couts: Cout[]| null

  @ApiProperty()
  paiements: Paiement[] | null

  @ApiProperty()
  updatedAt: Date

 
}

export class AchatReturn extends AchatFull {
  @ApiProperty()
  hasProductionLink : boolean = false

  // @ApiProperty()
  // qt_used : number
}


// ================VALIDATION


const MatiereInputSchema = z.object({
  id: z.string(
    {
      required_error: errors.MATIERE_REQUIRED,
      invalid_type_error: errors.MATIERE_MUST_BE_STRING,
    }
  ),
});
const MagasinInputSchema = z.object({
  id: z.string({
    required_error: errors.MAGASIN_REQUIRED,
    invalid_type_error: errors.MAGASIN_MUST_BE_STRING,
  }),
});

const LigneAchatInputSchema = z.object({
  id: z.string().optional(),
  prixUnitaire: z.number({
    required_error: errors.UNIT_PRICE_REQUIRED,
    invalid_type_error: errors.UNIT_PRICE_MUST_BE_NUMBER,
  }),
  quantite: z.number({
    required_error: errors.QUANTITY_REQUIRED,
    invalid_type_error: errors.QUANTITY_MUST_BE_NUMBER,
  }),
  quantiteLivre: z.number().optional(),
  datePeremption: z.string(),
  references: z.string(
    {
      required_error: errors.REFERENCE_REQUIRED,
      invalid_type_error: errors.REFERENCE_MUST_BE_STRING,
    }
  ).optional(),
  matiere: MatiereInputSchema,
  magasin: MagasinInputSchema,
});

const CoutInputSchema = z.object({
  id: z.string().optional(),
  libelle: z.string({
    required_error: errors.LABEL_REQUIRED,
    invalid_type_error: errors.LABEL_MUST_BE_STRING,
  }),
  montant: z.number({
    required_error: errors.MONTANT_REQUIRED,
    invalid_type_error: errors.MONTANT_MUST_BE_NUMBER_CHARGE,
  }),
  motif: z.string().optional().nullable(),
});

const PaiementInputSchema = z.object({
  montant: z.number({
    required_error: errors.MONTANT_REQUIRED,
    invalid_type_error: errors.MONTANT_MUST_BE_NUMBER,
  })
});

const frs = z.object({
  id: z.string(), 
});


const MagasinQuantiteLivreShema = z.object({
  quantiteLivre: z.number({
    required_error: 'La quantité est requise.',
    invalid_type_error: 'La quantité doit être un nombre.',
  }).min(0, 'La quantité doit être positive.'),
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
  tva: z.number({
    required_error: errors.TVA_REQUIRED,
    invalid_type_error: errors.TVA_BE_NUMBER,
  }),

  statutAchat: z.nativeEnum(StatutAchat).optional(),
  etat: z.nativeEnum(Etat).optional(),
  fournisseur: frs.optional(),
  ligneAchats: z.array(LigneAchatInputSchema),
  couts: z.array(CoutInputSchema),
  paiements: z.array(PaiementInputSchema),
});

export const PaiementSaverSchema = PaiementInputSchema;

export const CoutSaverSchema = CoutInputSchema;

export const LigneAchatSchema = LigneAchatInputSchema;

 export const MagasinQuantiteLivre = MagasinQuantiteLivreShema;