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
          feedback: "Semua kolom harus diisi untuk validasi." 
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing from environment variables");
      return NextResponse.json(
        { isValid: false, feedback: "Kesalahan konfigurasi AI: API Key tidak ditemukan." },
        { status: 500 }
      );
    }

    // Using gemini-3.1-flash-lite-preview which is free-tier compatible and very fast
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview",
    });

    const prompt = `
      Anda adalah validator bahasa Inggris profesional untuk siswa SMK. 
      Tugas Anda adalah memvalidasi entri kosakata berikut:
      
      Kata: "${word}"
      Kelas Kata (Part of Speech): "${partOfSpeech}"
      Arti (Meaning): "${meaning}"
      Kalimat (Sentence): "${sentence}"

      Kriteria validasi:
      1. Apakah kata tersebut sesuai dengan kelas katanya?
      2. Apakah artinya benar?
      3. Apakah kalimatnya menggunakan kata tersebut dengan tata bahasa (grammar) yang benar?

      Berikan feedback dalam bahasa Indonesia yang ramah, memotivasi, dan mendidik. Jika ada kesalahan, jelaskan di mana letak kesalahannya agar siswa bisa belajar.
      Jika benar, berikan pujian singkat dan konfirmasi bahwa entri sudah tepat.

      Kembalikan HANYA objek JSON dengan format:
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
        { isValid: false, feedback: "AI memberikan respon yang tidak valid. Silakan coba lagi." },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Gemini API Full Error:", error);
    
    // Handle quota errors (common in free tier)
    if (error?.message?.includes("429") || error?.status === 429) {
      return NextResponse.json(
        { isValid: false, feedback: "Batas penggunaan AI tercapai (Quota 429). Silakan tunggu sebentar dan coba lagi." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        isValid: false, 
        feedback: "Validasi AI gagal: " + (error?.message || "Periksa koneksi internet Anda.")
      },
      { status: 500 }
    );
  }
}
