import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import * as bcrypt from 'bcryptjs'


async function main() {
    const cryptedPassword = bcrypt.hashSync('12345678', 10)
    await prisma.utilisateur.create({
        data: {
            nom: 'Massire Dembele',
            email: 'dembelemassire34@gmail.com',
            password: cryptedPassword,
            role: {
                create: {
                    libelle: 'Administrateur',
                    // permissions: {},
                    accesses: {
                        createMany: {
                            data: [
                                { module: 'dashboard', read: true, write: true, remove: true, archive: true },
                                { module: 'depenses', read: true, write: true, remove: true, archive: true },
                                { module: 'parametres', read: true, write: true, remove: true, archive: true },
                                { module: 'traces', read: true, write: true, remove: true, archive: true },
                            ]
                        }
                    }
                }
            }
        },
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })