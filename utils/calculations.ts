
import { Product, Material, CalculationResult } from '../types';

export const calculateProductPrice = (
    prod: Product | Partial<Product>,
    materials: Material[],
    fixedCostPerHour: number,
    inkCostPerPage: number
): CalculationResult & { totalCost: number; suggestedPrice: number; } => { // Keeping existing calculateProductPrice flexible

    // Safety checks for Partial<Product>
    const prodMaterials = prod.materials || [];
    const printedPages = prod.printedPages || 0;
    const laborHours = prod.laborHours || 0;
    const laborRate = prod.laborRate || 0;
    const markup = prod.markup || 0;

    const matCost = prodMaterials.reduce((acc, pm) => {
        const m = materials.find(mat => mat.id === pm.materialId);
        if (!m) return acc;
        return acc + (m.cost / m.quantity) * pm.quantityUsed;
    }, 0);

    const printingCost = printedPages * inkCostPerPage;
    const laborCost = laborHours * laborRate;
    const fixedCostShare = laborHours * fixedCostPerHour;

    const totalCost = matCost + laborCost + printingCost + fixedCostShare;
    const markupVal = totalCost * (markup / 100);
    const suggestedPrice = totalCost + markupVal;

    return {
        materialCost: matCost,
        laborCost,
        printingCost,
        fixedCostShare,
        totalCost,
        suggestedPrice,
        profit: markupVal
    };
};
