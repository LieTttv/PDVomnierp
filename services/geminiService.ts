
import { GoogleGenAI } from "@google/genai";

// Fix: Obtaining the API key exclusively from process.env.API_KEY and using direct initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventoryInsights = async (products: any[]) => {
  try {
    const prompt = `Analyze the following inventory data and provide 3 key business recommendations in Brazilian Portuguese. Data: ${JSON.stringify(products)}`;
    
    // Fix: Using ai.models.generateContent directly with model name and prompt as per SDK guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar insights no momento. Verifique a configuração da chave de API.";
  }
};

export const optimizeRoute = async (destinations: string[]) => {
  try {
    const prompt = `Como um especialista em logística, otimize a sequência de entrega para estes endereços partindo de uma central em São Paulo. Forneça a ordem sugerida e uma breve justificativa. Endereços: ${destinations.join(' | ')}`;

    // Fix: Using ai.models.generateContent directly with model name and prompt as per SDK guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Route Optimization Error:", error);
    return "Erro ao otimizar rota. Verifique a conexão com o serviço de IA.";
  }
};
