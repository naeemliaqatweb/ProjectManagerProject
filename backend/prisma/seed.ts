import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Create a Test User
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            password: 'password123', // Added password field
        },
    });

    console.log(`Created/Updated user: ${user.email} (${user.id})`);

    // 2. Create a Test Project for this user
    const project = await prisma.project.create({
        data: {
            name: 'Sample Project',
            description: 'This is a test project created via seeding.',
            ownerId: user.id,
            columns: {
                create: [
                    { title: 'To Do', order: 0 },
                    { title: 'In Progress', order: 1 },
                    { title: 'Done', order: 2 },
                ],
            },
        },
    });

    console.log(`Created project: ${project.name} (${project.id}) with 3 columns.`);

    console.log('Seed finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
