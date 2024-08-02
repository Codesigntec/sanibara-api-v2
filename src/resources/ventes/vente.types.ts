import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"
import { errors } from "./vente.constant"

export class VenteFetcher extends FetcherFilter {
    etat?: boolean | null
}

export class Client{

    @ApiProperty()
    id: string

    @ApiProperty()
    nom: string

    @ApiProperty()
    telephone: string

    @ApiProperty()
    email: string
}

export class PaiementSave{
    @ApiProperty()
    montant: number
  }

export class VenteTable{

    @ApiProperty()
    id: string

    @ApiProperty()
    numero: number

    @ApiProperty()
    reference: string
  
    @ApiProperty()
    montant: number
  
    @ApiProperty()
    tva: number

    // @ApiProperty()
    // paye: number
    
    @ApiProperty()
    dateVente: Date

    @ApiProperty()
    createdAt: Date
   
    @ApiProperty()
    client: Client

    @ApiProperty()
    stockVente?: StockVenteProduiFiniId[]

    @ApiProperty()
    paiements: PaiementVente[]

}

export class PaiementVente{
    @ApiProperty()
    id: string
    @ApiProperty()
    montant: number
    @ApiProperty()
    createdAt: Date
    @ApiProperty()
    updatedAt: Date
  }

export class ProduitDto {
    @ApiProperty()
    id: string;
  
    @ApiProperty()
    designation?: string;

    @ApiProperty()
    description: string
  
  }
  
  export class StockProduiFiniDto {

    @ApiProperty()
    id: string

    @ApiProperty()
    produitFini: ProduitDto;
  
  }
  



export class Vente {

    @ApiProperty()
    id: string

    @ApiProperty()
    reference: string
  
    @ApiProperty()
    montant: number

    @ApiProperty()
    etat: boolean
  
    @ApiProperty()
    tva?: number

    // @ApiProperty()
    // paye: number
    
    @ApiProperty()
    dateVente: Date

    @ApiProperty()
    clientId?: string

    @ApiProperty()
    stockVente?: StockVenteFull[]

    @ApiProperty()
    paiements: PaiementVente[]


  }

  export class VenteArchiveDeleteAndDestory{

    @ApiProperty()
    id: string

    @ApiProperty()
    reference: string
  }
  export class StockVente{

    @ApiProperty()
    id: string
}
export class StockVenteProduiFiniId{

  @ApiProperty()
    id: string
    
  @ApiProperty()
    stockProduiFiniId: string

    @ApiProperty()
    prix_unitaire: number

}
export class StockVenteFull{

    @ApiProperty()
    quantiteVendue: number
    
    @ApiProperty()
    stockProduiFiniId: string

    @ApiProperty()
    prix_unitaire: number

    @ApiProperty()
    venteId: string
    
}


export class StockProduiFini{
    @ApiProperty()
    id: string

    @ApiProperty()
    qt_produit: number

    @ApiProperty()
    stockVente: StockVente[]

}

const PaiementInputSchema = z.object({
    montant: z.number({
      required_error: errors.MONTANT_REQUIRED,
      invalid_type_error: errors.MONTANT_MUST_BE_NUMBER,
    })
  });

const saverSchemaVente = z.object({
    reference: z.string(),
    montant: z.number(
        {
        required_error: errors.MONTANT_REQUIRED,
        invalid_type_error: errors.MONTANT_DOIT_ETRE_NOMBRE,
        }
    ),
    tva: z.number().nullable(),
    paiements: z.array(PaiementInputSchema),
    etat: z.boolean(),
    dateVente: z.string(),
    clientId: z.string(),
    stockVente: z.array(z.object({
        id: z.string().optional(),
        quantiteVendue: z.number(),
        prix_unitaire: z.number(),
        stockProduiFiniId: z.string(),
        venteId: z.string().optional()
    }))
})
export const PaiementSaverSchema = PaiementInputSchema;
export default saverSchemaVente