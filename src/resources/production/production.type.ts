import { z } from "zod";
import { errors } from "./production.constant";
import { ApiProperty } from "@nestjs/swagger";
import { MagasinSelect } from "../magasin/magasin.types";
import { Produit } from "../produit-fini/produit-fini.types";
import { LigneAchatFull } from "../achat/achat.types";

// =======================PRODUCTION===============================
export class ProductionsSaver{

    @ApiProperty()
    description: string

    @ApiProperty()
    references: string

    @ApiProperty()
    dateDebut: string

    @ApiProperty()
    dateFin: string

    @ApiProperty()
    stockProdFini: StockProduiFini[]

    @ApiProperty()
    productionLigneAchat: ProductionLigneAchat[]
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
export class ProductionLigneAchat{

    @ApiProperty()
    id: string

    @ApiProperty()
    createdAt: Date
    
    @ApiProperty()
    production: Productions

    @ApiProperty()
    ligneAchat: LigneAchatFull
}

// =========================== StockProduiFini ===============================
export class StockProduiFiniSaver{

    @ApiProperty()
    references: string
 
    @ApiProperty()
    pu_gros: number

    @ApiProperty()
    pu_detail: number

    @ApiProperty()
    qt_produit: number

    @ApiProperty()
    produitFini : Produit

    @ApiProperty()
    magasin: MagasinSelect
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