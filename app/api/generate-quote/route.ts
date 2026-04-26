import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildQuotePrompt } from "@/lib/ai/quote-prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en presupuestos comerciales para reformas, obra y limpieza profesional. Responde siempre en JSON válido.",
        },
        {
          role: "user",
          content: buildQuotePrompt(body),
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No se pudo generar el presupuesto" },
        { status: 500 }
      );
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error generando presupuesto",
        details: String(error),
      },
      { status: 500 }
    );
  }
}