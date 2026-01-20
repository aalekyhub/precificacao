import { Decimal } from '@prisma/client/runtime/library';

// Helper to convert Prisma Decimal to number for calculations
const toNumber = (d: Decimal | number): number => Number(d);

export interface CostBreakdown {
    variableCosts: number;
    fixedCostsAllocated: number;
    channelFixedFee: number;
    channelPercentFee: number;
    taxPercent: number; // if part of channel fees
    desiredMargin: number;
    suggestedPrice: number;
    isValid: boolean;
    error?: string;

    // Details
    materialCost: number;
    packagingCost: number;
    directLaborCost: number;
    setupCostAllocated: number;
}

/**
 * Calculates the Productive Price (PV) based on the mandatory formula:
 * PV = (CV + OH + TF) / (1 - T - L)
 * 
 * Where:
 * CV = Variable Costs (Materials + Packaging + Labor + Other)
 * OH = Overhead Allocated (Fixed Cost per Hour * Total Hours)
 * TF = Fixed Fee per Order (Channel)
 * T  = Total Percent Fees (Channel commission + ads + tax)
 * L  = Desired Profit Margin
 */
export const calculatePricing = (params: {
    materialCost: number;
    packagingCost: number;
    laborCost: number; // Unit labor
    setupCost: number; // Allocated setup labor
    overheadCost: number; // Allocated Fixed Costs (OH)
    channelFixedFee: number; // (TF)
    channelPercentTotal: number; // (T) 0.18 for 18%
    desiredMargin: number; // (L) 0.20 for 20%
}): CostBreakdown => {
    const {
        materialCost,
        packagingCost,
        laborCost,
        setupCost,
        overheadCost,
        channelFixedFee,
        channelPercentTotal,
        desiredMargin
    } = params;

    const CV = materialCost + packagingCost + laborCost + setupCost;
    const OH = overheadCost;
    const TF = channelFixedFee;
    const T = channelPercentTotal;
    const L = desiredMargin;

    const numerator = CV + OH + TF;
    const denominator = 1 - T - L;

    const breakdown: CostBreakdown = {
        variableCosts: CV,
        fixedCostsAllocated: OH,
        channelFixedFee: TF,
        channelPercentFee: T,
        taxPercent: 0, // Simplified assumption: tax is inside T as per requirements
        desiredMargin: L,
        suggestedPrice: 0,
        isValid: true,
        materialCost,
        packagingCost,
        directLaborCost: laborCost,
        setupCostAllocated: setupCost
    };

    // Validation 1: Denominator must be positive
    if (denominator <= 0) {
        breakdown.isValid = false;
        breakdown.error = "A soma das taxas e margem (T + L) deve ser menor que 100%.";
        return breakdown;
    }

    const PV = numerator / denominator;
    breakdown.suggestedPrice = PV;

    // Validation 2: Price must cover costs (Implicit in formula, but good to check sanity)
    if (PV < (CV + OH + TF)) {
        // This mathematically shouldn't happen if denom > 0 and num > 0, but serves as sanity check
        breakdown.isValid = false;
        breakdown.error = "Erro no cálculo: Preço menor que os custos.";
    }

    return breakdown;
};

/**
 * Calculates Material Cost including Loss %
 * RealCost = (Qty * UnitCost) / (1 - LossPct)
 */
export const calculateMaterialCost = (qty: number, unitCost: number, lossPct: number): number => {
    if (lossPct >= 1) return Infinity; // Avoid division by zero/negative
    return (qty * unitCost) / (1 - lossPct);
};

/**
 * Calculates Overhead Allocation
 * Overhead = (SetupMinutes + (UnitMinutes * Qty)) / 60 * FixedCostPerHour
 */
export const calculateOverhead = (
    setupMinutes: number,
    unitMinutes: number,
    quantity: number,
    fixedCostPerHour: number
): number => {
    const totalHours = (setupMinutes + (unitMinutes * quantity)) / 60;
    return totalHours * fixedCostPerHour;
};
