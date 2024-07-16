import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TraceService } from "../trace/trace.service";
import { Productions, ProductionsSaver } from "./production.type";


@Injectable()
export class ProductionService {
    
    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }




    save = async (data: ProductionsSaver, userId: string): Promise<Productions> => {
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.produitFini.findFirst({
                    where: {
                        designation: {
                            equals: data.designation,
                            mode: 'insensitive'
                        }
                    }
                })
                if (check !== null) throw new HttpException(errors.NAME_ALREADY_EXIST, HttpStatus.BAD_REQUEST);


                const matiere = await tx.produitFini.create({
                    data: {
                        designation: data.designation,
                        description: data.description,
                        unite: {
                            connect: { id: data.uniteId }
                        }
                    },
                    select: {
                        id: true,
                        numero: true,
                        designation: true,
                        description: true,
                        createdAt: true,
                        unite: {
                            select: {
                                id: true,
                                libelle: true
                            }
                        }
                    }
                })


                const description = `Ajout du produit fini: ${data.designation}`
                this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return matiere
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

}