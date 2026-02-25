import { GoogleGenAI } from "@google/genai";
import { Transaction, Stats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const aiService = {
  async getFinancialInsights(stats: Stats, transactions: Transaction[], profile: string) {
    const prompt = `
      Você é um consultor financeiro especialista. Analise os seguintes dados financeiros de um usuário com perfil "${profile}":
      
      Resumo:
      - Entradas Totais: R$ ${stats.total_income.toFixed(2)}
      - Saídas Totais: R$ ${stats.total_expense.toFixed(2)}
      - Saldo: R$ ${(stats.total_income - stats.total_expense).toFixed(2)}
      
      Últimas Transações:
      ${transactions.slice(0, 10).map(t => `- ${t.date}: ${t.description} (${t.category}) - R$ ${t.amount.toFixed(2)} [${t.type}]`).join('\n')}
      
      Por favor, forneça:
      1. Um resumo da saúde financeira atual.
      2. 3 dicas práticas de economia ou investimento baseadas nos gastos.
      3. Um alerta se houver algum padrão de gasto preocupante.
      
      Responda em Markdown, de forma amigável e profissional.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "Não foi possível gerar insights no momento.";
    } catch (error) {
      console.error("AI Insight Error:", error);
      return "Erro ao conectar com a inteligência artificial.";
    }
  }
};
