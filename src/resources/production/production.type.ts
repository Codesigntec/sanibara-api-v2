import { z } from "zod";
import { errors } from "./production.constant";
import { ApiProperty } from "@nestjs/swagger";
import { MagasinSelect } from "../magasin/magasin.types";
import { Produit } from "../produit-fini/produit-fini.types";
import {  LigneAchatProduction } from "../achat/achat.types";
import { FetcherFilter } from "src/common/types";

// =======================PRODUCTIONReturn===============================
export class ProdReturn{
  @ApiProperty()
  id: string;
}

// =======================DTOS===============================





export class MagasinProduitFiniDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom?: string;
}




export class ProduitDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  designation?: string;

}



export class StockProduiFiniDto {

  @ApiProperty()
  reference: string;

  @ApiProperty()
  pu_gros: number;

  @ApiProperty()
  pu_detail: number;

  @ApiProperty()
  datePeremption: Date;

  @ApiProperty()
  qt_produit: number;

  @ApiProperty()
  produitFini: ProduitDto;

  @ApiProperty()
  magasin: MagasinProduitFiniDto;
}


export class StockProduiFiniDtoUpdate {

  @ApiProperty()
  id: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  pu_gros: number;

  @ApiProperty()
  pu_detail: number;

  @ApiProperty()
  datePeremption: Date;

  @ApiProperty()
  qt_produit: number;

  @ApiProperty()
  produitFini: ProduitDto;

  @ApiProperty()
  magasin: MagasinProduitFiniDto;
}
export class ProductionLigneAchatDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  qt_Utilise: number;
}

// =======================PRODUCTION-SAVE===============================
export class ProdSave {
  @ApiProperty()
  description?: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  dateDebut: Date;

  @ApiProperty()
  dateFin?: Date;

  @ApiProperty()
  coutTotalProduction: number;

  @ApiProperty()
  beneficeDetails: number;

  @ApiProperty()
  beneficeGros: number;

  @ApiProperty({ type: [StockProduiFiniDto] })
  stockProdFini: StockProduiFiniDto[];

  @ApiProperty({ type: [ProductionLigneAchatDto] })
  productionLigneAchat: ProductionLigneAchatDto[];

  @ApiProperty()
  coutProduction: coutProdSave[]
}

// =======================PRODUCTION-Update===============================
export class ProdUpdate {
  @ApiProperty()
  description?: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  dateDebut: Date;

  @ApiProperty()
  coutTotalProduction: number;

  @ApiProperty()
  beneficeDetails: number;

  @ApiProperty()
  beneficeGros: number;

  @ApiProperty()
  dateFin?: Date;

  @ApiProperty({ type: [StockProduiFiniDtoUpdate] })
  stockProdFini: StockProduiFiniDtoUpdate[];

  @ApiProperty({ type: [ProductionLigneAchatDto] })
  productionLigneAchat: ProductionLigneAchatDto[];

  @ApiProperty()
  coutProduction: coutProdSave[]
}

//================================FLITRE===============================

export class ProductionFetcher extends FetcherFilter {
  debut?: string | null
  fin?: string | null
}

//======================================RETURN PRODUCTION===============================

export class ProductionLigneAchat{

  @ApiProperty()
  id: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  qt_Utilise: number

  @ApiProperty()
  ligneAchat: LigneAchatProduction

  @ApiProperty()
  productionId: string
}



export class ProductionsReturn{

  @ApiProperty()
  id: string
  
  @ApiProperty()
  numero: number

  @ApiProperty()
  coutTotalProduction: number;

  @ApiProperty()
  beneficeDetails: number;

  @ApiProperty()
  beneficeGros: number;

  @ApiProperty()
  description: string

  @ApiProperty()
  reference: string

  @ApiProperty()
  dateDebut: Date

  @ApiProperty()
  dateFin: Date

  @ApiProperty()
  stockProdFini: StockProduiFini[]

  @ApiProperty()
  productionLigneAchat: ProductionLigneAchat[]

  @ApiProperty()
  coutProduction: coutProdSave[]

  @ApiProperty()
  createdAt: Date


}



// =========================== StockProduiFini ===============================
export class StockProduiFiniSaver{

  @ApiProperty()
  reference: string

  @ApiProperty()
  pu_gros: number

  @ApiProperty()
  pu_detail: number

  @ApiProperty()
  datePeremption: Date

  @ApiProperty()
  qt_produit: number

  @ApiProperty()
  produitFini : ProduitDto

  @ApiProperty()
  magasin: MagasinProduitFiniDto
}

export class StockProduiFini extends StockProduiFiniSaver{

  @ApiProperty()
  id: string

  @ApiProperty()
  numero: number
}

// =========================== RETOUR TABLE ===============================

export class tableReturn{

  @ApiProperty()
  id: string

  @ApiProperty()
  numero: number

  @ApiProperty()
  reference: string
  
  @ApiProperty()
  produiFini: string[]

  @ApiProperty()
  description: string

  @ApiProperty()
  dateDebut: Date

  @ApiProperty()
  dateFin: Date

  @ApiProperty()
  coutTotalProduction : number

  @ApiProperty()
  hasStockVenteLink : boolean
}


export class coutProdSave{
  @ApiProperty()
  id: string

  @ApiProperty()
  libelle: string

  @ApiProperty()
  montant: number

  @ApiProperty()
  motif?: string

}

export class ProductionsSaver{

  @ApiProperty()
  description: string

  @ApiProperty()
  reference: string

  @ApiProperty()
  dateDebut: Date

  @ApiProperty()
  dateFin: Date

  @ApiProperty()
  stockProdFini: StockProduiFini[]

  @ApiProperty()
  productionLigneAchat: ProductionLigneAchatDto[]
}


export class Productions extends ProductionsSaver{

  @ApiProperty()
  id: string

  @ApiProperty()
  numero: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
} 



export class coutProduction extends coutProdSave{

  @ApiProperty()
  id: string

  @ApiProperty()
  prodId: string

  @ApiProperty()
  production: Productions 

}

















// =======================STOCKS PRODUIT FINI===============================

export class UniteSelect{

  @ApiProperty()
  id: string;

  @ApiProperty()
  libelle: string;
}

export class ProduitDtoStock {
  @ApiProperty()
  id: string;

  @ApiProperty()
  designation?: string;

  @ApiProperty()
  unite: UniteSelect;
}


export class StockReturn{

  @ApiProperty()
  id: string

  @ApiProperty()
  numero: number

  @ApiProperty()
  reference: string

  @ApiProperty()
  pu_gros: number 

  @ApiProperty()
  pu_detail: number 

  @ApiProperty()
  datePeremption: Date

  @ApiProperty()
  qt_produit: number

  @ApiProperty()
  magasin: MagasinProduitFiniDto

  @ApiProperty()
  produitFini: ProduitDtoStock

}


//================================FLITRE===============================

export class StockFetcher extends FetcherFilter {
  prodFiniId?: string | null
  magasinId?: string | null
}


// ============================== VALIDATION ====================================


const MagasinProduitFiniDtoSchema = z.object({
  id: z.string({
    invalid_type_error: errors.MAGASIN_ID_MUST_BE_STRING,
  }),
});

const ProduitDtoSchema = z.object({
  id: z.string({
    invalid_type_error: errors.PRODUIT_FIN_ID_MUST_BE_STRING,
  }),
});

const StockProduiFiniDtoSchema = z.object({
  id: z.string({
    invalid_type_error: errors.ID_MUST_BE_STRING,
  }).optional(),
  reference: z.string({
    invalid_type_error: errors.REFERENCE_MUST_BE_STRING,
  }),
  pu_gros: z.number({
    invalid_type_error: errors.PU_GROS_MUST_BE_NUMBER,
  }),
  pu_detail: z.number({
    invalid_type_error: errors.PU_DETAIL_MUST_BE_NUMBER,
  }),
  datePeremption: z.string({
    invalid_type_error: errors.DATE_PEREMPTION_MUST_BE_DATE,
  }),
  qt_produit: z.number({
    invalid_type_error: errors.QT_PRODUIT_MUST_BE_NUMBER,
  }),
  produitFini: ProduitDtoSchema,
  magasin: MagasinProduitFiniDtoSchema,
});

const ProductionLigneAchatDtoSchema = z.object({
  id: z.string({
    invalid_type_error: errors.PRODUCTION_LIGNE_ACHAT_ID_MUST_BE_STRING,
  }),
  qt_Utilise: z.number({
    invalid_type_error: errors.QT_PRODUIT_MUST_BE_NUMBER,
  }).optional(),
});

const CoutProduction = z.object({
  montant: z.number({
    invalid_type_error: errors.MONTANT_COUT_MUST_BE_NUMBER,
  }),
  libelle: z.string({
    invalid_type_error: errors.LIBELLE_COUT_MUST_BE_STRING,
  }),
  motif: z.string().nullable().optional(),
});

const ProdSaveSchema = z.object({
  description: z.union([
    z.string({
      invalid_type_error: errors.DESCRIPTION_MUST_BE_STRING,
    }).optional().nullable(), // Accepte string, undefined, null
    z.literal('')                      // Accepte chaîne vide
  ]),
  reference: z.union([
    z.string({
      invalid_type_error: errors.REFERENCE_MUST_BE_STRING,
    }).optional().nullable(), 
    z.literal('')
  ]),
  dateDebut: z.union([
    z.string({
      invalid_type_error: errors.DATE_DEBUT_MUST_BE_DATE,
    }).optional().nullable(),
    z.literal('')
  ]),
  coutTotalProduction: z.number({
    invalid_type_error: errors.MONTANT_COUT_TOTAL_MUST_BE_NUMBER,
  }),
  beneficeDetails: z.number({
    invalid_type_error: errors.MONTANT_BENEFICE_DETAIL_MUST_BE_NUMBER,
  }),
  beneficeGros: z.number({
    invalid_type_error: errors.MONTANT_BENEFICE_GROS_MUST_BE_NUMBER,
  }),
  dateFin: z.union([
    z.string({
      invalid_type_error: errors.DATE_FIN_MUST_BE_DATE,
    }).optional().nullable(),
    z.literal('')
  ]),
  coutProduction: z.array(CoutProduction),
  stockProdFini: z.array(StockProduiFiniDtoSchema),
  productionLigneAchat: z.array(ProductionLigneAchatDtoSchema),
}).required();

export { ProdSaveSchema };
