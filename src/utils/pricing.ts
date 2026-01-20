export interface CostBreakdown {
    variableCosts: number;
    fixedCostsAllocated: number;
    channelFixedFee: number;
    channelPercentFee: number;
    taxPercent: number;
    desiredMargin: number;
    suggestedPrice: number;
    isValid: boolean;
    error?: string;
    materialCost: number;
    packagingCost: number;
    directLaborCost: number;
    setupCostAllocated: number;
}

/**
 * Calculates the Productive Price (PV) based on the mandatory formula:
 * PV = (CV + OH + TF) / (1 - T - L)
 */
export const calculatePricing = (params: {
    materialCost: number;
    packagingCost: number;
    laborCost: number;
    setupCost: number;
    overheadCost: number;
    channelFixedFee: number;
    channelPercentTotal: number;
    desiredMargin: number;
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
        taxPercent: 0,
        desiredMargin: L,
        suggestedPrice: 0,
        isValid: true,
        materialCost,
        packagingCost,
        directLaborCost: laborCost,
        setupCostAllocated: setupCost
    };

    if (denominator <= 0) {
        breakdown.isValid = false;
        breakdown.error = "A soma das taxas e margem (T + L) deve ser menor que 100%.";
        return breakdown;
    }

    const PV = numerator / denominator;
    breakdown.suggestedPrice = PV;

    if (PV < (CV + OH + TF)) {
        breakdown.isValid = false;
        breakdown.error = "Erro no cálculo: Preço menor que os custos.";
    }

    return breakdown;
};

export const calculateMaterialCost = (qty: number, unitCost: number, lossPct: number): number => {
    if (lossPct >= 1) return Infinity;
    return (qty * unitCost) / (1 - lossPct);
};

export const calculateOverhead = (
    setupMinutes: number,
    unitMinutes: number,
    quantity: number,
    fixedCostPerHour: number
): number => {
    const totalHours = (setupMinutes + (unitMinutes * quantity)) / 60;
    return totalHours * fixedCostPerHour;
};
