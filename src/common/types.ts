import { ApiProperty } from "@nestjs/swagger"
import { Request } from "express"

export class FetcherFilter {
    removed?: boolean | null
    archive?: boolean | null
}
export class Pagination <T> {
    @ApiProperty()
    totalPages: number

    @ApiProperty()
    totalCount: number

    @ApiProperty()
    currentPage: number

    @ApiProperty()
    size: number

    data: T[]
}
export interface PaginationQuery {
    page?: number | null
    size?: number | null
    orderBy?: string | null
    orderDirection?: string | null
}
export interface AuthorizedRequest extends Request {
    userId: string
  }