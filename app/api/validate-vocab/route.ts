import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { word, partOfSpeech, meaning, sentence } = await req.json();

    if (!word || !partOfSpeech || !meaning || !sentence) {
      return NextResponse.json(
        { 
          isValid: false, 
          feedback: "All fields are required for validation." 
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing from environment variables");
      return NextResponse.json(
        { isValid: false, feedback: "AI configuration error: API Key missing." },
        { status: 500 }
      );
    }

    // Using gemini-3.1-flash-lite-preview which is free-tier compatible and very fast
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview",
    });

    const prompt = `
      You are an English language validator. 
      Validate this entry for a vocational student:
      
      Word: "${word}"
      Part of Speech: "${partOfSpeech}"
      Meaning: "${meaning}"
      Sentence: "${sentence}"

      Return ONLY a JSON object:
      {"isValid": boolean, "feedback": "string"}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean potential markdown from response
    text = text.replace(/```json|```/g, "").trim();
    
    try {
      const validationResult = JSON.parse(text);
      return NextResponse.json(validationResult);
    } catch (parseError) {
      console.error("Gemini Raw Response:", text);
      return NextResponse.json(
        { isValid: false, feedback: "AI returned a malformed response. Please try again." },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Gemini API Full Error:", error);
    
    // Handle quota errors (common in free tier)
    if (error?.message?.includes("429") || error?.status === 429) {
      return NextResponse.json(
        { isValid: false, feedback: "AI limit reached (Quota 429). Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        isValid: false, 
        feedback: "AI validation failed: " + (error?.message || "Check API Key and Connection.")
      },
      { status: 500 }
    );
  }
}
