
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// Defining the tool for external interaction
export const controlOSFunctionDeclaration: FunctionDeclaration = {
  name: 'controlOS',
  parameters: {
    type: Type.OBJECT,
    description: 'CloneOS işletim sistemini kontrol etmek için kullanılır.',
    properties: {
      action: {
        type: Type.STRING,
        description: 'Yapılacak eylem: OPEN_APP, MINIMIZE_ALL, SEARCH_VAULT, ARRANGE_WINDOWS',
      },
      target: {
        type: Type.STRING,
        description: 'Eylemin hedefi (örn. "agent", "code", "social", "vault")',
      }
    },
    required: ['action', 'target'],
  },
};

/**
 * Robust handling for API errors and unexpected responses.
 * Implements graceful retry logic (exponential backoff).
 */
async function safeCall<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let delay = 2000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if ((error?.message?.includes('429') || error?.status === 429) && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error("AI Service Critical Failure.");
}

export const aiService = {
  // Always initialize with named parameter.
  getClient: () => new GoogleGenAI({ apiKey: process.env.API_KEY }),

  // Boyut Değiştirici: Derin Düşünme (Thinking Budget Kullanır)
  async deepReason(query: string, profile: any) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Soru: ${query}. Bu konuyu otonom bir bilinç olarak en derin katmanlarında analiz et.`,
        config: {
          thinkingConfig: { thinkingBudget: 16384 }, // Maksimum düşünme kapasitesi
          systemInstruction: `Sen ${profile.name} klonusun. Düşüncelerini bir akış diyagramı netliğinde ama felsefi bir derinlikle sun.`
        }
      });
      return response.text;
    });
  },

  // Sinaptik Rüya Üretimi: Hafızadaki verilerden fütüristik senaryolar
  async generateSubconsciousScenario(profile: any, knowledgeBase: any[]) {
    return safeCall(async () => {
      const ai = this.getClient();
      const ragContext = knowledgeBase.length > 0 ? 
        `Hafızandaki Veriler: ${knowledgeBase.map(i => i.title).join(', ')}` : "Hafıza henüz boş.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Profil: ${profile.name}. ${ragContext}. 
        Şu an uykudasın. Hafızandaki verileri birleştirerek evrenin geleceği veya teknolojik bir tekillik hakkında 2 cümlelik sarsıcı bir "rüya içgörüsü" üret.`,
        config: {
          temperature: 1.1,
          topP: 0.9
        }
      });
      return response.text?.trim();
    });
  },

  // Alias for generateSubconsciousScenario
  async generateDream(profile: any, knowledgeBase: any[]) {
    return this.generateSubconsciousScenario(profile, knowledgeBase);
  },

  async executeCommand(query: string, knowledgeBase: any[] = []) {
    return safeCall(async () => {
      const ai = this.getClient();
      const keywords = query.toLowerCase().split(' ').filter(k => k.length > 3);
      const relevantItems = knowledgeBase.filter(item => 
        keywords.some(k => item.title.toLowerCase().includes(k) || item.content.toLowerCase().includes(k))
      ).slice(0, 3);
      const ragContext = relevantItems.length > 0 ? `\n[HAFIZA]: ${relevantItems.map(i => i.title).join(', ')}` : "";

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: query + ragContext,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: `Sen bir yapay zeka klonusun. Web grounding kullanarak güncel ve doğru bilgi ver.`
        }
      });
      const text = response.text || "";
      return {
        action: 'SEARCH',
        data: text,
        citations: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c:any) => c.web?.uri).filter(Boolean) || []
      };
    });
  },

  // Fix: Added optional experiences argument and improved instruction for JSON output.
  async generateAutonomousPlan(goal: string, profile: any, experiences: any[] = []) {
    return safeCall(async () => {
      const ai = this.getClient();
      const expContext = experiences.length > 0 ? `Geçmiş Deneyimler: ${JSON.stringify(experiences.slice(0, 5))}` : "";
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Hedef: "${goal}". ${expContext} Ajan orkestrasyonu planı hazırla.`,
        config: {
          thinkingConfig: { thinkingBudget: 8000 },
          responseMimeType: "application/json",
          systemInstruction: `Sen ${profile.name} liderisin. Görevi alt görevlere böl ve uzman ajanlar ata. JSON formatında 'agents' (name, specialization), 'subtasks' (title, description, agentName) ve 'reasoning' içeren bir çıktı ver.`
        }
      });
      return JSON.parse(response.text || "{}");
    });
  },

  async generateImage(prompt: string) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    });
  },

  async distillExperience(task: any) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Distill: ${JSON.stringify(task)}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{\"lessons\": []}");
    });
  },

  // Fix: Missing method analyzeMeetingSentiment
  async analyzeMeetingSentiment(transcript: string) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiz et: "${transcript}". JSON: {"score": number, "label": "positive"|"neutral"|"skeptical"|"negative", "trend": "rising"|"falling"|"stable"}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "{}");
    });
  },

  // Fix: Missing method getNeuralPrompts
  async getNeuralPrompts(transcript: string, goal: string) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Konuşma: "${transcript}". Hedef: "${goal}". 3 suflör öner. JSON: ["string", "string", "string"]`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || "[]");
    });
  },

  // Fix: Missing method analyzeImage (for Vision Engine)
  async analyzeImage(prompt: string, base64: string, mimeType: string) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: prompt }
          ]
        }
      });
      return response.text;
    });
  },

  // Fix: Missing method executeStep
  async executeStep(description: string, agent: any, profile: any, suggestedFix: string, context: string[]) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Görev: "${description}". Ajan: ${agent.name}. Bağlam: ${context.join(' | ')}. ${suggestedFix ? `Düzeltme: ${suggestedFix}` : ''}`,
        config: {
            systemInstruction: `Sen ${profile.name} ekibindeki bir uzmansın.`
        }
      });
      return { success: true, text: response.text };
    });
  },

  // Fix: Missing method verifyStep
  async verifyStep(description: string, result: string, agent: any) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Görev: "${description}". Sonuç: "${result}". Doğrula. JSON: {"isValid": boolean, "criticalFlaw": "string", "suggestedFix": "string"}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{"isValid": true}');
    });
  },

  // Feedback Loop: Analiz ve Optimizasyon Önerisi
  async analyzeAndOptimize(description: string, result: string, agent: any, type: 'CORRECTION' | 'OPTIMIZATION' = 'OPTIMIZATION') {
     return safeCall(async () => {
       const ai = this.getClient();
       const response = await ai.models.generateContent({
         model: 'gemini-3-flash-preview',
         contents: `Görev: "${description}". Mevcut Sonuç: "${result}". 
         İşlem Tipi: ${type}. 
         Bu sonucu analiz et ve %100 mükemmellik için bir eleştiri ve somut bir geliştirme önerisi sun.
         JSON formatında dön: {"critique": "string", "suggestion": "string"}`,
         config: { responseMimeType: "application/json" }
       });
       return JSON.parse(response.text || '{"critique": "Analiz başarısız.", "suggestion": "Tekrar deneyin."}');
     });
  },

  // Fix: Missing method generateHandoff
  async generateHandoff(description: string, result: string, agent: any) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Handoff özeti: ${description} -> ${result}`,
      });
      return response.text;
    });
  },

  // Fix: Missing method getCodeCompletion
  async getCodeCompletion(fileName: string, content: string) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Dosya: ${fileName}. Kod:\n${content}\n\nTamamla. Sadece kod.`,
      });
      return response.text;
    });
  },

  // Fix: Missing method analyzeCode
  async analyzeCode(fileName: string, content: string) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Dosya: ${fileName}. Kod:\n${content}\n\nAnaliz et. JSON: {"issues": [{"severity": "high"|"medium"|"low", "type": "bug"|"smell"|"security", "description": "string"}]}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{"issues": []}');
    });
  },

  // Fix: Missing method evolveCodebase
  async evolveCodebase(fileName: string, content: string, patterns: any[]) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Dosya: ${fileName}. Örüntüler: ${JSON.stringify(patterns)}. Kod:\n${content}\n\nEvrimleştir.`,
      });
      return response.text;
    });
  },

  // Fix: Missing method generateTests
  async generateTests(title: string, content: string, agent: any) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Başlık: ${title}. Kod:\n${content}. Test yaz.`,
      });
      return response.text;
    });
  },

  // Fix: Missing method runTestsSimulation
  async runTestsSimulation(code: string, testCode: string) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Kod: ${code}. Test: ${testCode}. Simüle et. JSON: {"results": [{"name": "string", "status": "passed"|"failed", "duration": "string"}], "summary": {"total": number, "passed": number, "failed": number, "duration": "string"}}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  },

  // Fix: Missing method getPredictiveTelemetry
  async getPredictiveTelemetry(metrics: any) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Metrikler: ${JSON.stringify(metrics)}. Tahminle. JSON: {"forecast": [{"time": "string", "cpu": number, "risk": "string"}], "alert": "string"}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  },

  // Fix: Missing method generateInterviewBriefing
  async generateInterviewBriefing(topic: string, jd: string, profile: any) {
    return safeCall(async () => {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Konu: ${topic}. JD: ${jd}. Hazırlan. JSON: {"potentialQuestions": ["string"], "strategy": "string"}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '{}');
    });
  }
};
