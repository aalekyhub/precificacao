import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. INSUMOS (Materials) - 8 items
    const insumos = [
        { name: 'Papel Offset 180g', unit: 'FL', unitCost: 0.35, lossPct: 0.05, supplier: 'Papelaria X' },
        { name: 'Papel Lamicote Dourado', unit: 'FL', unitCost: 2.50, lossPct: 0.05, supplier: 'LuxoPapers' },
        { name: 'Cola Pano', unit: 'ML', unitCost: 0.15, lossPct: 0.10, supplier: 'TekBond' },
        { name: 'Fita Banana', unit: 'CM', unitCost: 0.05, lossPct: 0, supplier: 'Adere' },
        { name: 'Palito de Acrílico', unit: 'UN', unitCost: 0.80, lossPct: 0, supplier: 'Shopee' },
        { name: 'Tinta Impressora (Cota)', unit: 'ML', unitCost: 0.10, lossPct: 0, supplier: 'Epson' },
        { name: 'Papelão Cinza', unit: 'FL', unitCost: 4.00, lossPct: 0.08, supplier: 'Cartonagem Z' },
        { name: 'Laço Cetim No. 9', unit: 'MT', unitCost: 1.20, lossPct: 0.02, supplier: 'Armarinho' },
    ];

    for (const i of insumos) {
        await prisma.insumo.create({ data: i });
    }

    // 2. CANAIS (Channels) - 4 items
    const c = await prisma.canal.createMany({
        data: [
            { name: 'Venda Direta (Pix/Dinheiro)', percentFeesTotal: 0.0, fixedFeePerOrder: 0.0 }, // 0%
            { name: 'Shopee (Clássico)', percentFeesTotal: 0.14, fixedFeePerOrder: 3.00, adsIncluded: false }, // 14% + R$3
            { name: 'Elo7', percentFeesTotal: 0.18, fixedFeePerOrder: 0.00, adsIncluded: true }, // 18%
            { name: 'Mercado Livre (Premium)', percentFeesTotal: 0.19, fixedFeePerOrder: 5.00, adsIncluded: true }, // 19% + R$5
        ]
    });

    // 3. FIXOS MENSAIS (Fixed Costs)
    await prisma.fixosMensais.create({
        data: {
            month: new Date().toISOString().slice(0, 7), // Current YYYY-MM
            totalFixedCosts: 1800.00, // Internet, Light, MEI, Depreciation
            productiveHours: 120.00   // 6h/day * 20 days
        }
    });

    // 4. PRODUTOS (2 items: Topo de Bolo & Caixa Milk)

    // -- Topo de Bolo --
    const topo = await prisma.produto.create({
        data: {
            name: 'Topo de Bolo Personalizado (Luxo)',
            category: 'Topos',
            unit: 'UN',
            description: 'Topo em camadas com lamicote e impressão alta qualidade'
        }
    });

    // Get Insumo IDs
    const offset = await prisma.insumo.findFirst({ where: { name: 'Papel Offset 180g' } });
    const lamicote = await prisma.insumo.findFirst({ where: { name: 'Papel Lamicote Dourado' } });
    const palito = await prisma.insumo.findFirst({ where: { name: 'Palito de Acrílico' } });
    const cola = await prisma.insumo.findFirst({ where: { name: 'Cola Pano' } });
    const fita = await prisma.insumo.findFirst({ where: { name: 'Fita Banana' } });

    if (offset && lamicote && palito && cola && fita) {
        await prisma.bOMItem.createMany({
            data: [
                { produtoId: topo.id, insumoId: offset.id, qtyPerUnit: 2, appliesTo: 'PRODUCT' }, // 2 folhas
                { produtoId: topo.id, insumoId: lamicote.id, qtyPerUnit: 1, appliesTo: 'PRODUCT' }, // 1 folha
                { produtoId: topo.id, insumoId: palito.id, qtyPerUnit: 2, appliesTo: 'PRODUCT' }, // 2 palitos
                { produtoId: topo.id, insumoId: cola.id, qtyPerUnit: 5, appliesTo: 'PRODUCT' }, // 5ml
                { produtoId: topo.id, insumoId: fita.id, qtyPerUnit: 20, appliesTo: 'PRODUCT' }, // 20cm
            ]
        });
    }

    await prisma.processoEtapa.createMany({
        data: [
            { produtoId: topo.id, name: 'Arte Digital', setupMinutes: 30, unitMinutes: 0 }, // Setup only
            { produtoId: topo.id, name: 'Corte (Plotter)', setupMinutes: 5, unitMinutes: 10 },
            { produtoId: topo.id, name: 'Montagem', setupMinutes: 0, unitMinutes: 15 },
        ]
    });

    // -- Caixa Milk --
    const caixa = await prisma.produto.create({
        data: {
            name: 'Caixa Milk 3D',
            category: 'Lembrancinhas',
            unit: 'UN',
        }
    });

    const laco = await prisma.insumo.findFirst({ where: { name: 'Laço Cetim No. 9' } });

    if (offset && laco && cola) {
        await prisma.bOMItem.createMany({
            data: [
                { produtoId: caixa.id, insumoId: offset.id, qtyPerUnit: 1, appliesTo: 'PRODUCT' },
                { produtoId: caixa.id, insumoId: laco.id, qtyPerUnit: 0.3, appliesTo: 'PRODUCT' }, // 30cm
                { produtoId: caixa.id, insumoId: cola.id, qtyPerUnit: 2, appliesTo: 'PRODUCT' },
            ]
        });
    }

    await prisma.processoEtapa.createMany({
        data: [
            { produtoId: caixa.id, name: 'Corte e Vinco', setupMinutes: 5, unitMinutes: 3 },
            { produtoId: caixa.id, name: 'Montagem e Colagem', setupMinutes: 0, unitMinutes: 5 },
        ]
    });

    console.log('✅ Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
