import { ApiProperty } from "@nestjs/swagger"
import { ClientSelect } from "../client/client.types"


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