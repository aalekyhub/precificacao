import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB Connection...');
    console.log('URL:', process.env.DATABASE_URL ? 'Yielded (Hidden)' : 'MISSING');

    try {
        const count = await prisma.produto.count();
        console.log(`Connection successful! Found ${count} products.`);

        const newProduct = await prisma.produto.create({
            data: {
                name: "Test Connection Product",
                category: "Test",
                unit: "UN"
            }
        });
        console.log("Created product:", newProduct.id);

        // Cleanup
        await prisma.produto.delete({ where: { id: newProduct.id } });
        console.log("Cleanup successful.");

    } catch (e) {
        console.error("Connection Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
