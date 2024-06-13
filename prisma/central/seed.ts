import { PrismaClient } from "@okucraft/code_central";
const prisma = new PrismaClient()


async function main() {

    await prisma.store.create({
        data: {
            key: 'kzzqn9y4',
            email: 'm.dembele@codesign.tech',
            app: 'sanibara',
            db: 'sanibara',
            name: 'sanibara codesign',
            subscriptions: {
                create: {
                    end: new Date('2024-12-31'),
                    start: new Date('2024-01-01'),
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