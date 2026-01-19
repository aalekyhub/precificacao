
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Material, CalculationResult } from "../types";

// Always use the process.env.API_KEY string directly when initializing the @google/genai client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPricingAdvice = async (
  product: Product,
  materials: Material[],
  result: CalculationResult
) => {
  const materialList = product.materials.map(pm => {
    const m = materials.find(mat => mat.id === pm.materialId);
    return `${m?.name}: ${pm.quantityUsed}${m?.unit}`;
  }).join(', ');

  const prompt = `
    Analyze this product pricing for a handmade craft business:
    Product Name: ${product.name}
    Materials Used: ${materialList}
    Total Material Cost: $${result.materialCost.toFixed(2)}
    Labor Hours: ${product.laborHours}
    Labor Rate: $${product.laborRate}/hr
    Markup: ${product.markup}%
    Current Suggested Price: $${result.suggestedPrice.toFixed(2)}
    Profit per unit: $${result.profit.toFixed(2)}

    Please provide:
    1. A brief assessment of the pricing strategy.
    2. Two specific suggestions to optimize profit or reduce costs.
    3. A market positioning tip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional business consultant specializing in handmade crafts and artisanal products. Provide concise, actionable advice."
      }
    });
    // Corrected: response.text is a property, not a method.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate advice at this time. Please try again later.";
  }
};
