import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RoleFetcher, RoleSaver, Role, RoleSelect, RoleFull, AccessSaver } from './role.types';
import { errors } from './role.constant';
import { TraceService } from '../trace/trace.service';
import { Pagination, PaginationQuery } from 'src/common/types';

@Injectable()
export class RoleService {

    constructor(
        private db: PrismaClient,
        private trace: TraceService
    ) { }

    list = async (filter: RoleFetcher, query: PaginationQuery): Promise<Pagination<Role>> => {
        const conditions = { ...filter }
        const limit = query.size ? query.size : 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let order = {}
        if (query.orderBy) {
            order[query.orderBy] = query.orderDirection ? query.orderDirection : 'asc'
        }


        const roles = await this.db.role.findMany({
            take: limit,
            skip: offset,
            where: conditions,
            select: { id: true, numero: true, libelle: true, createdAt: true, },
            orderBy: order
        })

        const totalCount = await this.db.role.count({ where: conditions });

        const totalPages = Math.ceil(totalCount / limit);
        const pagination: Pagination<Role> = {
            data: roles,
            totalPages,
            totalCount,
            currentPage: query.page ? query.page : 1,
            size: limit
        }

        return pagination
    }

    select = async (): Promise<RoleSelect[]> => {
        const roles = await this.db.role.findMany({
            where: { removed: false, archive: false },
            select: { id: true, libelle: true }
        })
        return roles
    }

    findById = async (id: string): Promise<RoleFull> => {
        const role = await this.db.role.findUnique({
            where: { id },
            select: {
                id: true,
                numero: true,
                libelle: true,
                createdAt: true,
                updatedAt: true,
                accesses: {
                    select: {
                        id: true,
                        module: true,
                        read: true,
                        write: true,
                        remove: true,
                        archive: true,
                    }
                },
                users: {
                    select: {
                        id: true,
                        numero: true,
                        nom: true,
                        email: true,
                        status: true
                    }
                }
            }
        })
        if (role === null) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);
        return role
    }

    save = async (data: RoleSaver, userId: string): Promise<Role> => {
        const check = await this.db.role.findFirst({
            where: {
                libelle: {
                    equals: data.libelle,
                    mode: 'insensitive'
                }
            }
        })
        if (check !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const role = await this.db.role.create({
            data: {
                libelle: data.libelle
            },
            select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Ajout du rôle: ${data.libelle}`
        this.trace.logger({ action: 'Ajout', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return role
    }

    update = async (id: string, data: RoleSaver, userId: string): Promise<Role> => {
        const check = await this.db.role.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const checkFirst = await this.db.role.findFirst({
            where: {
                id: {
                    not: id
                },
                libelle: {
                    equals: data.libelle,
                    mode: 'insensitive'
                }
            }
        })
        if (checkFirst !== null) throw new HttpException(errors.ALREADY_EXIST, HttpStatus.BAD_REQUEST);

        const role = await this.db.role.update({
            where: { id },
            data: {
                libelle: data.libelle
            },
            select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Modification du rôle: ${check.libelle} -> ${data.libelle}`
        this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return role
    }

    archive = async (id: string, userId: string): Promise<Role> => {
        const check = await this.db.role.findUnique({ where: { id: id }, select: { libelle: true, archive: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const role = await this.db.role.update({
            where: { id },
            data: {
                archive: !check.archive
            },
            select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Archivage du rôle: ${check.libelle}`
        this.trace.logger({ action: 'Archivage', description, userId }).then(res => console.log("TRACE SAVED: ", res))

        return role
    }

    remove = async (id: string, userId: string): Promise<Role> => {
        const check = await this.db.role.findUnique({ where: { id: id }, select: { libelle: true, removed: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        const role = await this.db.role.update({
            where: { id },
            data: {
                removed: !check.removed
            },
            select: { id: true, numero: true, libelle: true, createdAt: true }
        })

        const description = `Suppression logique du rôle: ${check.libelle}`
        this.trace.logger({ action: 'Suppression logique', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return role
    }

    destroy = async (id: string, userId: string): Promise<Role> => {
        const check = await this.db.role.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        try {
            const role = await this.db.role.delete({
                where: { id },
                select: { id: true, numero: true, libelle: true, createdAt: true }
            })

            const description = `Suppression physique du rôle: ${check.libelle}`
            this.trace.logger({ action: 'Suppression physique', description, userId }).then(res => console.log("TRACE SAVED: ", res))

            return role
        } catch (_: any) {
            throw new HttpException(errors.NOT_REMOVABLE, HttpStatus.BAD_REQUEST);
        }
    }

    setAccesses = async (id: string, data: AccessSaver[], userId: string): Promise<Role> => {
        const check = await this.db.role.findUnique({ where: { id: id }, select: { libelle: true } })
        if (!check) throw new HttpException(errors.NOT_EXIST, HttpStatus.BAD_REQUEST);

        for (const access of data) {
            await this.db.access.upsert({
                where: {
                    module_roleId: {
                        module: access.module,
                        roleId: id
                    }
                },
                create: {
                    module: access.module,
                    read: access.read,
                    write: access.write,
                    remove: access.remove,
                    archive: access.archive,
                    role: {
                        connect: { id }
                    }
                },
                update: {
                    read: access.read,
                    write: access.write,
                    remove: access.remove,
                    archive: access.archive,
                }
            })
        }

        const description = `Modification de la des permissions du rôle: ${check.libelle}`
        this.trace.logger({ action: 'Modification', description, userId }).then(res => console.log("TRACE SAVED: ", res))


        return await this.findById(id)
    }
}
