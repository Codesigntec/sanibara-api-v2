import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"
import { z } from "zod"

export class VenteFetcher extends FetcherFilter {
}


export class VenteTable{

    @ApiProperty()
    id: string

    @ApiProperty()
    reference: string
  
    @ApiProperty()
    montant: number
  
    @ApiProperty()
    tva: number

    @ApiProperty()
    paye: number
    
    @ApiProperty()
    dateVente: Date

    @ApiProperty()
    createdAt: Date

    client: Client

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

export class Vente {

    @ApiProperty()
    id: string

    @ApiProperty()
    reference: string
  
    @ApiProperty()
    montant: number
  
    @ApiProperty()
    tva: number

    @ApiProperty()
    paye: number
    
    @ApiProperty()
    dateVente: Date

    @ApiProperty()
    cleintId: string

    @ApiProperty()
    stockVente: StockVenteFull[]

  }
  export class StockVente{

    @ApiProperty()
    id: string
}

export class StockVenteFull{

    @ApiProperty()
    quantiteVendue: number
    
    @ApiProperty()
    stockProduiFiniId: string

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

const saverSchemaVente = z.object({
    reference: z.string(),
    montant: z.number(),
    tva: z.number(),
    paye: z.number(),
    dateVente: z.date(),
    cleintId: z.string(),
    stockVente: z.array(z.object({
        id: z.string(),
        quantiteVendue: z.number(),
        stockProduiFiniId: z.string(),
        venteId: z.string()
    }))
})

export default saverSchemaVente