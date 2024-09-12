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
                                { module: 'approvisionnements_identification', read: true, write: true, remove: true, archive: true },
                                { module: 'achats_commandes', read: true, write: true, remove: true, archive: true },
                                { module: 'stocks_matiere_premiere', read: true, write: true, remove: true, archive: true },
                                { module: 'magasin_matieres_premieres', read: true, write: true, remove: true, archive: true },
                                { module: 'productions', read: true, write: true, remove: true, archive: true },
                                { module: 'produits_finis_identification', read: true, write: true, remove: true, archive: true },
                                { module: 'stocks_produit_finis', read: true, write: true, remove: true, archive: true },
                                { module: 'magasins_produits_finis', read: true, write: true, remove: true, archive: true },
                                { module: 'ventes', read: true, write: true, remove: true, archive: true },
                                { module: 'devis', read: true, write: true, remove: true, archive: true },
                                { module: 'charges_fixes', read: true, write: true, remove: true, archive: true },
                                { module: 'resultats', read: true, write: true, remove: true, archive: true },
                                { module: 'utilisateurs', read: true, write: true, remove: true, archive: true },
                                { module: 'access', read: true, write: true, remove: true, archive: true },
                                { module: 'roles', read: true, write: true, remove: true, archive: true },
                                { module: 'unites', read: true, write: true, remove: true, archive: true },
                                { module: 'fournisseurs', read: true, write: true, remove: true, archive: true },
                                { module: 'clients', read: true, write: true, remove: true, archive: true },  
                                { module: 'devise', read: true, write: true, remove: true, archive: true },
                                { module: 'traces', read: true, write: true, remove: true, archive: true },
                                { module: 'structure', read: true, write: true, remove: true, archive: true },
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