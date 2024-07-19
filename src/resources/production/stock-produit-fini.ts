import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";



@Injectable()
export class StocksService {
    
    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

}