import { PrismaClient } from "@okucraft/code_central";
const prisma = new PrismaClient()


async function main() {

    await prisma.store.create({
        data: {
          key: 'sani9y4',
          email: 'karimdiawara96@gmail.com',
          app: 'sanibara',
          db: 'sanibara',
          name: 'Sanibara Codesign',
          subscriptions: {
            create: {
              start: new Date('2024-01-01'),
              end: new Date('2024-12-31'),
              pack: 'premium', // pack field added, can be 'essai' or another value
              partnerToken: 'some-partner-token', // optional, nullable value
              amount: 100, // amount field, replace with actual value if needed
            },
          },
        },
      });
      
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