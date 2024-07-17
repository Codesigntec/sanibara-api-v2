import { z } from "zod";
import { errors } from "./production.constant";
import { ApiProperty } from "@nestjs/swagger";
import { MagasinSelect } from "../magasin/magasin.types";
import { Produit } from "../produit-fini/produit-fini.types";
import {  LigneAchatFull1 } from "../achat/achat.types";

// =======================PRODUCTIONReturn===============================
export class ProdReturn{
  @ApiProperty()
  id: string;
}

// =======================DTOS===============================
export class MagasinProduitFiniDto {
  @ApiProperty()
  id: string;
}

export class ProduitDto {
  @ApiProperty()
  id: string;
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

export class ProductionLigneAchatDto {
  @ApiProperty()
  id: string;
}

// =======================PRODUCTION-SAVE===============================
export class ProdSave {
  @ApiProperty()
  description: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  dateDebut: Date;

  @ApiProperty()
  dateFin: Date;

  @ApiProperty({ type: [StockProduiFiniDto] })
  stockProdFini: StockProduiFiniDto[];

  @ApiProperty({ type: [ProductionLigneAchatDto] })
  productionLigneAchat: ProductionLigneAchatDto[];
}






















// =======================PRODUCTION===============================

export class LigneAchatFull{
  @ApiProperty()
  id: string
}
export class ProductionLigneAchat{

  @ApiProperty()
  id: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  ligneAchat: LigneAchatFull1

  @ApiProperty()
  productionId: string
}


// export class ProductionLigneAchatDto{

//   @ApiProperty()
//   id: string

//   @ApiProperty()
//   createdAt: Date

//   @ApiProperty()
//   ligneAchat: LigneAchatFull

//   @ApiProperty()
//   productionId: string
// }

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

// ============================= LIGNE ACHAT ===============================
export class ProductionLigneAchatSave{

    @ApiProperty()
    productionId: string

    @ApiProperty()
    ligneAchatId: string

}


export class ProductionsReturn{

  @ApiProperty()
  id: string
  
  @ApiProperty()
  numero: number

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
  createdAt: Date
}


export class ProductionLigneAchatFull extends ProductionLigneAchat{
    @ApiProperty()
    production: Productions
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

export class StockProduiFiniFull extends StockProduiFini{

      @ApiProperty()
      productions: Productions

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
});


const ProdSaveSchema = z.object({
  description: z.string({
    invalid_type_error: errors.DESCRIPTION_MUST_BE_STRING,
  }),
  reference: z.string({
    invalid_type_error: errors.REFERENCE_MUST_BE_STRING,
  }),
  dateDebut: z.string({
    invalid_type_error: errors.DATE_DEBUT_MUST_BE_DATE,
  }),
  dateFin: z.string({
    invalid_type_error: errors.DATE_FIN_MUST_BE_DATE,
  }),
  stockProdFini: z.array(StockProduiFiniDtoSchema),
  productionLigneAchat: z.array(ProductionLigneAchatDtoSchema),
}).required();

export { ProdSaveSchema };
