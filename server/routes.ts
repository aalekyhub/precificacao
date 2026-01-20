import { Router } from 'express';
import { prisma } from './db';
import { calculatePricing, calculateMaterialCost, calculateOverhead } from './logic';
import { z } from 'zod';

const router = Router();

// --- INSUMOS (Materials) ---
router.get('/insumos', async (req, res) => {
    const items = await prisma.insumo.findMany({ orderBy: { name: 'asc' } });
    res.json(items);
});

router.post('/insumos', async (req, res) => {
    const schema = z.object({
        name: z.string(),
        unit: z.string(),
        unitCost: z.number(),
        lossPct: z.number().default(0),
        supplier: z.string().optional().nullable(),
        yieldNotes: z.string().optional().nullable()
    });

    try {
        const data = schema.parse(req.body);
        const item = await prisma.insumo.create({
            data: {
                name: data.name,
                unit: data.unit,
                unitCost: data.unitCost,
                lossPct: data.lossPct,
                supplier: data.supplier || undefined,
                yieldNotes: data.yieldNotes || undefined
            }
        });
        res.json(item);
    } catch (e) {
        res.status(400).json({ error: e });
    }
});

router.put('/insumos/:id', async (req, res) => {
    try {
        const item = await prisma.insumo.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to update material" });
    }
});

router.delete('/insumos/:id', async (req, res) => {
    try {
        await prisma.insumo.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete material" });
    }
});

// --- PRODUTOS (with BOM and Steps) ---
router.get('/produtos', async (req, res) => {
    const items = await prisma.produto.findMany({
        include: {
            bomItems: { include: { insumo: true } },
            steps: true
        },
        orderBy: { name: 'asc' }
    });
    res.json(items);
});

router.post('/produtos', async (req, res) => {
    // Complex implementation with nested writes handled by frontend sending proper structure
    // For simplicity, we assume basic creation first, then updates
    try {
        const item = await prisma.produto.create({
            data: {
                name: req.body.name,
                category: req.body.category,
                unit: req.body.unit || 'UN',
                description: req.body.description
            }
        });
        res.json(item);
    } catch (e) { res.status(500).json({ error: e }); }
});

router.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, unit, description, bomItems, steps } = req.body;

    try {
        // Transaction to update product and replace relations
        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.produto.update({
                where: { id },
                data: { name, category, unit, description }
            });

            // Update BOM
            if (bomItems) {
                await tx.bOMItem.deleteMany({ where: { produtoId: id } });
                if (bomItems.length > 0) {
                    await tx.bOMItem.createMany({
                        data: bomItems.map((b: any) => ({
                            produtoId: id,
                            insumoId: b.insumoId,
                            qtyPerUnit: b.qtyPerUnit,
                            appliesTo: b.appliesTo,
                            notes: b.notes
                        }))
                    });
                }
            }

            // Update Steps
            if (steps) {
                await tx.processoEtapa.deleteMany({ where: { produtoId: id } });
                if (steps.length > 0) {
                    await tx.processoEtapa.createMany({
                        data: steps.map((s: any) => ({
                            produtoId: id,
                            name: s.name,
                            setupMinutes: s.setupMinutes,
                            unitMinutes: s.unitMinutes
                        }))
                    });
                }
            }

            return product;
        });
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update product" });
    }
});

router.delete('/produtos/:id', async (req, res) => {
    await prisma.produto.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

// --- CANAIS ---
router.get('/canais', async (req, res) => {
    const items = await prisma.canal.findMany();
    res.json(items);
});
router.post('/canais', async (req, res) => {
    const item = await prisma.canal.create({ data: req.body });
    res.json(item);
});
router.put('/canais/:id', async (req, res) => {
    const item = await prisma.canal.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
});
router.delete('/canais/:id', async (req, res) => {
    await prisma.canal.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

// --- FIXED COSTS ---
router.get('/fixos', async (req, res) => {
    const items = await prisma.fixosMensais.findMany({ orderBy: { month: 'desc' } });
    res.json(items);
});
router.post('/fixos', async (req, res) => {
    // Upsert by month
    const { month, totalFixedCosts, productiveHours } = req.body;
    const item = await prisma.fixosMensais.upsert({
        where: { month },
        update: { totalFixedCosts, productiveHours },
        create: { month, totalFixedCosts, productiveHours }
    });
    res.json(item);
});

// --- PRICING CALCULATOR ---
router.post('/precificacao/calcular', async (req, res) => {
    const { produtoId, canalId, quantity, month, desiredMargin } = req.body;

    try {
        // Fetch data
        const product = await prisma.produto.findUnique({
            where: { id: produtoId },
            include: { bomItems: { include: { insumo: true } }, steps: true }
        });
        const channel = await prisma.canal.findUnique({ where: { id: canalId } });
        const fixed = await prisma.fixosMensais.findUnique({ where: { month } }) ||
            await prisma.fixosMensais.findFirst({ orderBy: { month: 'desc' } }); // Fallback to latest

        if (!product || !channel || !fixed) {
            return res.status(404).json({ error: "Dados incompletos (Produto, Canal ou Custos Fixos não encontrados)" });
        }

        // 1. Calculate Materials Cost (with Yield/Loss)
        let materialCost = 0;
        let packagingCost = 0;

        for (const item of product.bomItems) {
            const cost = calculateMaterialCost(
                Number(item.qtyPerUnit) * quantity, // Total qty needed
                Number(item.insumo.unitCost),
                Number(item.insumo.lossPct)
            );

            if (item.appliesTo === 'PACKAGING') packagingCost += cost;
            else materialCost += cost;
        }

        // Per unit normalization for the breakdown (the formula uses totals or per unit, algebra is same if consistent)
        // Let's do TOTALS for the batch, then divide by qty for unit view

        // 2. Calculate Labor & Overhead
        let totalSetupMins = 0;
        let totalUnitMins = 0;

        for (const step of product.steps) {
            totalSetupMins += Number(step.setupMinutes);
            totalUnitMins += Number(step.unitMinutes);
        }

        const fixedCostPerHour = Number(fixed.totalFixedCosts) / Number(fixed.productiveHours);
        const overheadCost = calculateOverhead(totalSetupMins, totalUnitMins, quantity, fixedCostPerHour);

        // Direct Labor (if we had rates per step, we would sum them here. 
        // For now, assuming direct labor is covered in fixed salary unless 'laborRatePerHour' is set on step)
        // The requirements say "Direct Labor (production labor)... Indirect Labor (admin/sales) to be included in overhead"
        // Let's assume for this MVB that labor IS the overhead allocation of time, UNLESS explicitly set.
        let directLaborCost = 0; // TODO: Implement specific direct labor rates if requested. 
        // Current requirement: "Overhead allocation: Product overhead = TotalProductionTimeHours * FixedCostPerProductiveHour"
        // This usually COVERS direct labor in small workshops where owner does everything.

        // 3. Pricing Formula
        const result = calculatePricing({
            materialCost: materialCost / quantity, // Per Unit
            packagingCost: packagingCost / quantity, // Per Unit
            laborCost: directLaborCost / quantity,
            setupCost: 0, // Setup time acts as overhead in this model? 
            // WAIT - Setup vs Unit scaling requirement (5): "Total production time = Setup + UnitTime * quantity"
            // Overhead is calculated on TOTAL time. So Overhead Per Unit = TotalOverhead / Qty
            overheadCost: overheadCost / quantity,
            channelFixedFee: Number(channel.fixedFeePerOrder) / quantity, // amortized per unit if batch? Or per order?
            // Usually fixed fee is PER SALE. If this calculation is for a sale of Qty items:
            // If they sell 50 items in ONE order (Shopee), the fixed fee is once.
            // If they sell 50 items separately, it's 50 times.
            // Assumption: 'quantity' in calculator = "Batch Size for Production" OR "Order Quantity".
            // Let's assume Order Quantity.
            channelPercentTotal: Number(channel.percentFeesTotal),
            desiredMargin: Number(desiredMargin)
        });

        res.json(result);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erro no cálculo" });
    }
});

export { router };
