import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import { UtilisateurFetcher, UtilisateurSaver, Utilisateur, UtilisateurSelect, UtilisateurUpdater, UtilisateurFull } from './utilisateur.types';
import { errors } from './utilisateur.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class UtilisateurService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: UtilisateurFetcher, query: PaginationQuery): Promise<Pagination<Utilisateur>> => {
        let conditions: any = { }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        if (filter.search) {
            conditions = {
                OR: [
                    { nom: { contains: filter.search, mode: "insensitive" } },
                    { email: { contains: filter.search, mode: "insensitive" } },
                     {  role: {
                        libelle: { contains: filter.search, mode: 'insensitive' } // Recherche par `libelle` dans le modèle `Role`
                      }
                    }
                ]
            }
        }

        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }

        conditions = { ...conditions, removed: filter.removed, archive: filter.archive }
        const utilisateurs = await this.db.utilisateur.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: {
                id: true,
                numero: true,
                nom: true,
                email: true,
                status: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        libelle: true
                    }
                }
            },
            orderBy: order
        })

        const totalCount = await this.db.utilisateur.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Utilisateur> = {
            data: utilisateurs,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<UtilisateurSelect[]> => {
        const utilisateurs = await this.db.utilisateur.findMany({
            where: { removed: false, archive: false },
            select: { id: true, nom: true }
        })
        return utilisateurs
    }

    findById = async (id: string): Promise<UtilisateurFull> => {
        
        
        const utilisateur = await this.db.utilisateur.findUnique({
            where: { id },
            select: {
                id: true,
                numero: true,
                nom: true,
                email: true,
                status: true,
                archive: true,
                removed: true,
                createdAt: true,
                updatedAt: true,
                role: {
                    select: {
                        id: true,
                        libelle: true
                    }
                },
                accesMagasinsProduitsFinis: {
                    select: {
                        magasin: {
                            select: {
                                id: true,
                                nom: true
                            }
                        },
                    }
                },
                accesMagasinsMatierePremieres: {
                    select: {
                        magasin: {
                            select: {
                                id: true,
                                nom: true
                            }
                        },
                    }
                }
            }
        })

        if (utilisateur === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
        return utilisateur
    }

    save = async (data: UtilisateurSaver, userId: string): Promise<Utilisateur> => {

        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.utilisateur.findFirst({
                    where: { 
                        email: {
                            equals: data.email,
                            mode: 'insensitive'
                        }
                    } 
                })
                if (check !== null) throw new HttpException(errors.EMAIL_ALREADY_EXIST, HttpStatus.BAD_REQUEST);

                const cryptedPassword = bcrypt.hashSync(data.password, 10)

                const utilisateur = await tx.utilisateur.create({
                    data: {
                        nom: data.nom,
                        email: data.email,
                        password: cryptedPassword,
                        role: {
                            connect: { id: data.roleId }
                        }
                    },
                    select: {
                        id: true,
                        numero: true,
                        nom: true,
                        email: true,
                        status: true,
                        createdAt: true,
                        role: {
                            select: {
                                id: true,
                                libelle: true
                            }
                        }
                    }
                })
                if (data.magasinsMatieresPremieres) {
                    const magasinUtilisateurs: { magasinId: string, utilisateurId: string }[] = []
                    data.magasinsMatieresPremieres.forEach(item => {
                        magasinUtilisateurs.push({ magasinId: item.value, utilisateurId: utilisateur.id })
                    });
                    await tx.magasinUtilisateurMatierePremiere.createMany({
                        data: magasinUtilisateurs
                    })
                }
                if (data.magasinsPrduitsFinis) {
                    const magasinUtilisateurs: { magasinId: string, utilisateurId: string }[] = []
                    data.magasinsPrduitsFinis.forEach(item => {
                        magasinUtilisateurs.push({ magasinId: item.value, utilisateurId: utilisateur.id })
                    });
                    await tx.magasinUtilisateurProduitFini.createMany({
                        data: magasinUtilisateurs
                    })
                }

                const description = `Ajout d'utilisateur: ${data.nom}`
                this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

                return utilisateur
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    update = async (id: string, data: UtilisateurUpdater, userId: string): Promise<Utilisateur> => {
        return await this.db.$transaction(async (tx) => {
            try {
                const check = await tx.utilisateur.findUnique({ where: { id: id }, select: { password: true, nom: true } })
                if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

                const checkFirst = await tx.utilisateur.findFirst({
                    where: {
                        id: {
                            not: id
                        },
                        email: {
                            equals: data.email,
                            mode: 'insensitive'
                        }
                    }
                })
                if (checkFirst !== null) throw new HttpException(errors.EMAIL_ALREADY_EXIST, HttpStatus.BAD_REQUEST);

                const cryptedPassword = data.password ? bcrypt.hashSync(data.password, 10) : check.password

                const utilisateur = await tx.utilisateur.update({
                    where: { id },
                    data: {
                        nom: data.nom,
                        email: data.email,
                        password: cryptedPassword,
                        role: {
                            connect: { id: data.roleId }
                        },
                    },
                    select: {
                        id: true,
                        numero: true,
                        nom: true,
                        email: true,
                        status: true,
                        createdAt: true,
                        role: {
                            select: {
                                id: true,
                                libelle: true
                            }
                        }
                    }
                })

                await tx.magasinUtilisateurMatierePremiere.deleteMany({
                    where: { utilisateurId: utilisateur.id }
                })
                await tx.magasinUtilisateurProduitFini.deleteMany({
                    where: { utilisateurId: utilisateur.id }
                })

                if (data.magasinsMatieresPremieres) {
                    const magasinUtilisateurs: { magasinId: string, utilisateurId: string }[] = []
                    data.magasinsMatieresPremieres.forEach(item => {
                        magasinUtilisateurs.push({ magasinId: item.value, utilisateurId: utilisateur.id })
                    });
                    await tx.magasinUtilisateurMatierePremiere.createMany({
                        data: magasinUtilisateurs
                    })
                }
                if (data.magasinsPrduitsFinis) {
                    const magasinUtilisateurs: { magasinId: string, utilisateurId: string }[] = []
                    data.magasinsPrduitsFinis.forEach(item => {
                        magasinUtilisateurs.push({ magasinId: item.value, utilisateurId: utilisateur.id })
                    });
                    await tx.magasinUtilisateurProduitFini.createMany({
                        data: magasinUtilisateurs
                    })
                }

                const description = `Modification de l'utilisateur: ${check.nom} -> ${data.nom}`
                this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))


                return utilisateur
            } catch (error: any) {
                if (error.status) throw new HttpException(error.message, error.status);
                else throw new HttpException(errors.UNKNOWN_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
    }

    archive = async (id: string, userId: string): Promise<Utilisateur> => {
        const check = await this.db.utilisateur.findUnique({ where: { id: id }, select: { nom: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const utilisateur = await this.db.utilisateur.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: {
                id: true,
                numero: true,
                nom: true,
                email: true,
                status: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        libelle: true
                    }
                }
            }
            // select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Archivage de l'utilisateur: ${check.nom}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return utilisateur
    }

    remove = async (id: string, userId: string): Promise<Utilisateur> => {
        const check = await this.db.utilisateur.findUnique({ where: { id: id }, select: { nom: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const utilisateur = await this.db.utilisateur.update({
            where: { id },
            data: {
                removed: !check.removed,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                numero: true,
                nom: true,
                email: true,
                status: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        libelle: true
                    }
                }
            }
            // select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Suppression logique de l'utilisateur: ${check.nom}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return utilisateur
    }

    destroy = async (id: string, userId: string): Promise<Utilisateur> => {
        const check = await this.db.utilisateur.findUnique({ where: { id: id }, select: { nom: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const utilisateur = await this.db.utilisateur.delete({
                where: { id },
                select: {
                    id: true,
                    numero: true,
                    nom: true,
                    email: true,
                    status: true,
                    createdAt: true,
                    role: {
                        select: {
                            id: true,
                            libelle: true
                        }
                    }
                }
                // select: { id: true, numero: true, libelle: true, createdAt: true }
            })

            const description = `Suppression physique de l'utilisateur: ${check.nom}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return utilisateur
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }
}
