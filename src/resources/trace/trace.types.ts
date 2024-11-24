import { ApiProperty } from "@nestjs/swagger"
import { FetcherFilter } from "src/common/types"

export class CategorieFetcher extends FetcherFilter {
}

export class TraceSaver {
  description: string
  action: string
  userId: string
}

export class TraceFetcher {
  action: string | null
  utilisateurId: string | null
  email: string | null
  debut: string | null
  fin: string | null
  search?: string | null
}

// ============= RESPONSE
class TraceUser {
  @ApiProperty()
  email: string
}

export class Trace {
  @ApiProperty()
  id: string
  @ApiProperty()
  action: string
  @ApiProperty()
  description: string
  @ApiProperty()
  createdAt: Date
  @ApiProperty()
  utilisateur: TraceUser
}

