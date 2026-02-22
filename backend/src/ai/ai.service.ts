import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private prisma = new PrismaClient();
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    // User has a typo in .env: Gemnini_API_KEY
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      this.configService.get<string>('Gemnini_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
  }

  async generateTask(text: string, projectId: string) {
    try {
      // 1. Fetch existing labels for context
      const existingLabels = await this.prisma.label.findMany({
        where: { projectId },
        select: { name: true },
      });
      const labelNames = existingLabels.map((l) => l.name).join(', ');

      const prompt = `
        You are an expert project manager.
        Based on the user's raw text input, generate a structured task object.

        User Input: "${text}"

        Existing Labels in Project: [${labelNames}]

        Instructions:
        1. Extract a concise 'title'.
        2. Create a detailed 'description'.
        3. Choose the most relevant 'suggestedLabel' from the existing labels list. If none fit perfectly, suggest a new, short label name (e.g. "Bug", "Feature", "Urgent").
        
        Return ONLY valid JSON. No markdown formatting (no \`\`\`json blocks).
        The JSON must match this structure:
        {
          "title": "string",
          "description": "string",
          "suggestedLabel": "string"
        }
      `;

      // Use Gemini Flash Latest model (standard free tier)
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      if (!textResponse) throw new Error('No content from Gemini');

      // Clean up potentially markdown formatted response (Gemini often adds ```json ... ```)
      const cleanContent = textResponse
        .replace(/^```json/g, '')
        .replace(/```$/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleanContent);
    } catch (error: any) {
      this.logger.error('Error generating task structure', error);
      throw new Error(`Failed to generate task structure: ${error.message}`);
    }
  }
}
